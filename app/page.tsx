import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLastIncomeDate, getMonthSummary, getTrend } from "@/lib/data/dashboard";
import { buildTip } from "@/lib/motivation";
import StatTile from "@/components/StatTile";
import DashboardChart from "@/components/DashboardChart";
import MotivationBanner from "@/components/MotivationBanner";
import ExportButton from "@/components/ExportButton";
import AssistantPanel from "@/components/AssistantPanel";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "ZAR" });
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function previousMonth() {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const month = currentMonth();
  const [summary, trend, lastIncomeDate] = await Promise.all([
    getMonthSummary(supabase, user.id, month),
    getTrend(supabase, user.id, 6),
    getLastIncomeDate(supabase, user.id),
  ]);

  const topExpense = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0];
  const tip = buildTip({
    topExpenseCategory: topExpense?.[0] ?? null,
    topExpenseAmount: topExpense?.[1] ?? 0,
    netDeficit: summary.net,
    lastIncomeDate,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <ExportButton month={month} label="Export this month" />
          <ExportButton month={previousMonth()} label="Export last month" />
        </div>
      </div>

      {summary.net < 0 && <MotivationBanner tip={tip} deficit={summary.net} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Income this month" value={formatMoney(summary.income)} tone="good" />
        <StatTile label="Expenses this month" value={formatMoney(summary.expense)} tone="bad" />
        <StatTile
          label="Net"
          value={formatMoney(summary.net)}
          tone={summary.net >= 0 ? "good" : "bad"}
        />
      </div>

      <DashboardChart data={trend} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#0b0b0b] dark:text-white">Recent activity</h2>
            <Link href="/transactions" className="text-xs font-medium text-[#2a78d6]">
              View all
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {summary.transactions.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-[#52514e] dark:text-[#c3c2b7]">
                  {t.occurred_on} &middot; {t.category}
                </span>
                <span className={t.type === "income" ? "text-[#006300]" : "text-[#d03b3b]"}>
                  {t.type === "income" ? "+" : "-"}
                  {formatMoney(Number(t.amount))}
                </span>
              </li>
            ))}
            {summary.transactions.length === 0 && (
              <li className="text-sm text-[#898781]">Nothing logged this month yet.</li>
            )}
          </ul>
        </div>

        <AssistantPanel compact />
      </div>
    </div>
  );
}
