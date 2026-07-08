import type { SupabaseClient } from "@supabase/supabase-js";
import type { Invoice } from "@/lib/supabase/types";

export async function listInvoices(supabase: SupabaseClient, userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("user_id", userId)
    .order("issue_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Invoice[];
}

export async function getInvoice(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Invoice | null;
}

export function invoiceTotals(invoice: Invoice) {
  const items = invoice.invoice_items ?? [];
  const subtotal = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
  const tax = subtotal * (Number(invoice.tax_rate) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export async function nextInvoiceNumber(supabase: SupabaseClient, userId: string): Promise<string> {
  const { count, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const n = (count ?? 0) + 1;
  return `INV-${String(n).padStart(4, "0")}`;
}
