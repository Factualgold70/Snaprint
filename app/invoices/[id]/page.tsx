import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvoice, invoiceTotals } from "@/lib/data/invoices";
import InvoiceActions from "@/components/InvoiceActions";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#898781]/15 text-[#52514e]",
  sent: "bg-[#eda100]/15 text-[#c98500]",
  paid: "bg-[#0ca30c]/15 text-[#006300]",
};

export default async function InvoiceDetailPage({
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

  const { subtotal, tax, total } = invoiceTotals(invoice);
  const items = (invoice.invoice_items ?? []).sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{invoice.invoice_number}</h1>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={`/invoices/${invoice.id}/pdf`}
            className="rounded-md border border-[#c3c2b7] px-3 py-1.5 text-sm font-medium"
          >
            Download PDF
          </a>
          <Link href={`/invoices/${invoice.id}/edit`} className="rounded-md border border-[#c3c2b7] px-3 py-1.5 text-sm font-medium">
            Edit
          </Link>
        </div>
      </div>

      <InvoiceActions id={invoice.id} status={invoice.status} />

      <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
        <div className="mb-4 flex justify-between text-sm">
          <div>
            <p className="text-[#898781]">Bill to</p>
            <p className="font-medium">{invoice.client_name}</p>
            {invoice.client_email && <p className="text-[#52514e] dark:text-[#c3c2b7]">{invoice.client_email}</p>}
          </div>
          <div className="text-right">
            <p className="text-[#898781]">Issued {invoice.issue_date}</p>
            {invoice.due_date && <p className="text-[#898781]">Due {invoice.due_date}</p>}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-[#898781]">
            <tr>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Unit price</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-[#e1e0d9] dark:border-[#2c2c2a]">
                <td className="py-2">{it.description}</td>
                <td className="py-2 text-right">{Number(it.quantity)}</td>
                <td className="py-2 text-right">${Number(it.unit_price).toFixed(2)}</td>
                <td className="py-2 text-right">${(Number(it.quantity) * Number(it.unit_price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 self-end text-right text-sm">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax ({Number(invoice.tax_rate)}%): ${tax.toFixed(2)}</p>
          <p className="font-semibold">Total: ${total.toFixed(2)}</p>
        </div>

        {invoice.notes && (
          <div className="mt-4 text-sm">
            <p className="text-[#898781]">Notes</p>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
