"use client";

import InvoiceForm from "@/components/InvoiceForm";
import { updateInvoice } from "@/lib/actions/invoices";
import type { InvoiceInput } from "@/lib/actions/invoices";
import type { Invoice } from "@/lib/supabase/types";

export default function EditInvoiceClient({ invoice }: { invoice: Invoice }) {
  return <InvoiceForm invoice={invoice} onSubmit={(input: InvoiceInput) => updateInvoice(invoice.id, input)} />;
}
