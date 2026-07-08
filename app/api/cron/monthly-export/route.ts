import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMonthlyWorkbook } from "@/lib/excel";
import type { Invoice, Transaction } from "@/lib/supabase/types";

function previousMonth() {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(m === 12 ? year + 1 : year, m % 12, 1)).toISOString().slice(0, 10);
  return { start, end };
}

const BUCKET = "exports";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  await supabase.storage.createBucket(BUCKET, { public: false }).catch(() => {});

  const month = previousMonth();
  const { start, end } = monthRange(month);

  const { data: rows } = await supabase
    .from("transactions")
    .select("user_id")
    .gte("occurred_on", start)
    .lt("occurred_on", end);
  const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id as string)));

  const results: { user_id: string; ok: boolean }[] = [];
  for (const userId of ids) {
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("occurred_on", start)
        .lt("occurred_on", end);
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("user_id", userId)
        .gte("issue_date", start)
        .lt("issue_date", end);

      const workbook = await buildMonthlyWorkbook(
        month,
        (transactions ?? []) as Transaction[],
        (invoices ?? []) as Invoice[]
      );
      const buffer = await workbook.xlsx.writeBuffer();

      await supabase.storage
        .from(BUCKET)
        .upload(`${userId}/${month}.xlsx`, Buffer.from(buffer), {
          upsert: true,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

      results.push({ user_id: userId, ok: true });
    } catch {
      results.push({ user_id: userId, ok: false });
    }
  }

  return NextResponse.json({ month, generated: results.length, results });
}
