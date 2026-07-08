import { createClient } from "@/lib/supabase/server";
import { listTransactions } from "@/lib/data/transactions";
import { buildMonthlyWorkbook } from "@/lib/excel";
import type { Invoice } from "@/lib/supabase/types";

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(m === 12 ? year + 1 : year, m % 12, 1)).toISOString().slice(0, 10);
  return { start, end };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { start, end } = monthRange(month);
  const [transactions, invoicesResult] = await Promise.all([
    listTransactions(supabase, user.id, { month }),
    supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("user_id", user.id)
      .gte("issue_date", start)
      .lt("issue_date", end),
  ]);

  if (invoicesResult.error) {
    return new Response(invoicesResult.error.message, { status: 500 });
  }

  const workbook = await buildMonthlyWorkbook(month, transactions, (invoicesResult.data ?? []) as Invoice[]);
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="snaprint-${month}.xlsx"`,
    },
  });
}
