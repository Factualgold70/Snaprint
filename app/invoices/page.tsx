import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listInvoices, invoiceTotals } from "@/lib/data/invoices";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#898781]/15 text-[#52514e]",
  sent: "bg-[#eda100]/15 text-[#c98500]",
  paid: "bg-[#0ca30c]/15 text-[#006300]",
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const invoices = user ? await listInvoices(supabase, user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="rounded-md bg-[#2a78d6] px-3 py-1.5 text-sm font-medium text-white"
        >
          New invoice
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e1e0d9] dark:border-[#2c2c2a]">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-[#fcfcfb] text-left text-[#898781] dark:bg-[#1a1a19]">
            <tr>
              <th className="px-3 py-2 font-medium">Number</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Issued</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const { total } = invoiceTotals(inv);
              return (
                <tr key={inv.id} className="border-t border-[#e1e0d9] dark:border-[#2c2c2a]">
                  <td className="px-3 py-2">
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-[#2a78d6]">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{inv.client_name}</td>
                  <td className="px-3 py-2">{inv.issue_date}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium">${total.toFixed(2)}</td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-[#898781]">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
