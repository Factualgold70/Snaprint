"use client";

import InvoiceForm from "@/components/InvoiceForm";
import { createInvoice } from "@/lib/actions/invoices";

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">New invoice</h1>
      <InvoiceForm onSubmit={createInvoice} />
    </div>
  );
}
