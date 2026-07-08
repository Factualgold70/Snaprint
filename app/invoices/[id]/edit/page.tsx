import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvoice } from "@/lib/data/invoices";
import EditInvoiceClient from "@/components/EditInvoiceClient";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const invoice = await getInvoice(supabase, user.id, id);
  if (!invoice) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Edit {invoice.invoice_number}</h1>
      <EditInvoiceClient invoice={invoice} />
    </div>
  );
}
