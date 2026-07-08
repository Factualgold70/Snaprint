"use client";

import { useMemo, useState, useTransition } from "react";
import type { Invoice } from "@/lib/supabase/types";
import type { InvoiceInput } from "@/lib/actions/invoices";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function InvoiceForm({
  invoice,
  onSubmit,
}: {
  invoice?: Invoice;
  onSubmit: (input: InvoiceInput) => Promise<void>;
}) {
  const [clientName, setClientName] = useState(invoice?.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(invoice?.client_email ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? todayISO());
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? "");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [taxRate, setTaxRate] = useState(String(invoice?.tax_rate ?? 0));
  const [items, setItems] = useState(
    invoice?.invoice_items && invoice.invoice_items.length > 0
      ? invoice.invoice_items
          .sort((a, b) => a.position - b.position)
          .map((it) => ({ description: it.description, quantity: String(it.quantity), unit_price: String(it.unit_price) }))
      : [{ description: "", quantity: "1", unit_price: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const tax = subtotal * ((Number(taxRate) || 0) / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [items, taxRate]);

  function updateItem(i: number, patch: Partial<(typeof items)[number]>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: "1", unit_price: "" }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }
    const validItems = items.filter((it) => it.description.trim().length > 0);
    if (validItems.length === 0) {
      setError("Add at least one line item.");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit({
          client_name: clientName,
          client_email: clientEmail,
          issue_date: issueDate,
          due_date: dueDate,
          notes,
          tax_rate: Number(taxRate) || 0,
          items: validItems.map((it) => ({
            description: it.description,
            quantity: Number(it.quantity) || 0,
            unit_price: Number(it.unit_price) || 0,
          })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save invoice.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Client name
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Client email
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Issue date
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Line items</span>
          <button type="button" onClick={addItem} className="text-xs font-medium text-[#2a78d6]">
            + Add item
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-6 gap-2">
              <input
                placeholder="Description"
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                className="col-span-3 rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Qty"
                value={it.quantity}
                onChange={(e) => updateItem(i, { quantity: e.target.value })}
                className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit price"
                value={it.unit_price}
                onChange={(e) => updateItem(i, { unit_price: e.target.value })}
                className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-xs font-medium text-[#d03b3b]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex max-w-[160px] flex-col gap-1 text-sm font-medium">
        Tax rate (%)
        <input
          type="number"
          min="0"
          step="0.01"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
        />
      </label>

      <div className="self-end text-sm">
        <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
        <p>Tax: ${totals.tax.toFixed(2)}</p>
        <p className="font-semibold">Total: ${totals.total.toFixed(2)}</p>
      </div>

      {error && <p className="text-sm text-[#d03b3b]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Saving..." : invoice ? "Save changes" : "Create invoice"}
      </button>
    </form>
  );
}
