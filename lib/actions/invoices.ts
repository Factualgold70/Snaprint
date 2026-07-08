"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invoiceTotals, nextInvoiceNumber } from "@/lib/data/invoices";
import type { Invoice, InvoiceStatus } from "@/lib/supabase/types";

export type InvoiceItemInput = { description: string; quantity: number; unit_price: number };

export type InvoiceInput = {
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  notes: string;
  tax_rate: number;
  items: InvoiceItemInput[];
};

export async function createInvoice(input: InvoiceInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const invoiceNumber = await nextInvoiceNumber(supabase, user.id);

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      client_name: input.client_name,
      client_email: input.client_email,
      issue_date: input.issue_date,
      due_date: input.due_date || null,
      notes: input.notes,
      tax_rate: input.tax_rate,
      status: "draft",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const items = input.items
    .filter((it) => it.description.trim().length > 0)
    .map((it, i) => ({
      invoice_id: invoice.id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      position: i,
    }));

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("invoice_items").insert(items);
    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      client_name: input.client_name,
      client_email: input.client_email,
      issue_date: input.issue_date,
      due_date: input.due_date || null,
      notes: input.notes,
      tax_rate: input.tax_rate,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("invoice_items").delete().eq("invoice_id", id);
  const items = input.items
    .filter((it) => it.description.trim().length > 0)
    .map((it, i) => ({
      invoice_id: id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      position: i,
    }));
  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("invoice_items").insert(items);
    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error) throw new Error(error.message);

  if (status === "paid" && invoice.status !== "paid") {
    const { total } = invoiceTotals(invoice as Invoice);
    const { data: txn, error: txnError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "income",
        amount: total,
        category: "Invoice Payment",
        description: `Invoice ${invoice.invoice_number} - ${invoice.client_name}`,
        occurred_on: new Date().toISOString().slice(0, 10),
        source: "invoice",
      })
      .select()
      .single();
    if (txnError) throw new Error(txnError.message);

    await supabase.from("invoices").update({ status, transaction_id: txn.id }).eq("id", id);
  } else {
    await supabase.from("invoices").update({ status }).eq("id", id);
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
}
