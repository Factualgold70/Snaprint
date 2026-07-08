import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/supabase/types";

export interface MonthSummary {
  month: string;
  income: number;
  expense: number;
  net: number;
  byCategory: Record<string, number>;
  transactions: Transaction[];
}

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(m === 12 ? year + 1 : year, m % 12, 1)).toISOString().slice(0, 10);
  return { start, end };
}

export async function getMonthSummary(
  supabase: SupabaseClient,
  userId: string,
  month: string
): Promise<MonthSummary> {
  const { start, end } = monthRange(month);
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_on", start)
    .lt("occurred_on", end)
    .order("occurred_on", { ascending: false });

  if (error) throw new Error(error.message);
  const transactions = (data ?? []) as Transaction[];

  let income = 0;
  let expense = 0;
  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "income") income += amount;
    else {
      expense += amount;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + amount;
    }
  }

  return { month, income, expense, net: income - expense, byCategory, transactions };
}

export interface TrendPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export async function getTrend(
  supabase: SupabaseClient,
  userId: string,
  monthsBack = 6
): Promise<TrendPoint[]> {
  const now = new Date();
  const months: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }

  const oldestStart = monthRange(months[0]).start;
  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, occurred_on")
    .eq("user_id", userId)
    .gte("occurred_on", oldestStart);
  if (error) throw new Error(error.message);

  const totals = new Map<string, { income: number; expense: number }>();
  for (const month of months) totals.set(month, { income: 0, expense: 0 });

  for (const row of data ?? []) {
    const key = String(row.occurred_on).slice(0, 7);
    const bucket = totals.get(key);
    if (!bucket) continue;
    if (row.type === "income") bucket.income += Number(row.amount);
    else bucket.expense += Number(row.amount);
  }

  return months.map((month) => {
    const bucket = totals.get(month)!;
    const [year, m] = month.split("-").map(Number);
    const label = new Date(Date.UTC(year, m - 1, 1)).toLocaleString(undefined, {
      month: "short",
    });
    return { month, label, income: bucket.income, expense: bucket.expense, net: bucket.income - bucket.expense };
  });
}

export async function getLastIncomeDate(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("occurred_on")
    .eq("user_id", userId)
    .eq("type", "income")
    .order("occurred_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.occurred_on ?? null;
}
