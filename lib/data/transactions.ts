import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/supabase/types";

export const DEFAULT_CATEGORIES = {
  income: ["Shopify Sales", "Custom Orders", "Commissions", "Other"],
  expense: ["Filament", "Resin", "Electricity", "Printer Maintenance", "Shipping", "Software", "Marketing", "Other"],
};

export async function listTransactions(
  supabase: SupabaseClient,
  userId: string,
  filters: { month?: string; type?: "income" | "expense" }
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month) {
    const [year, month] = filters.month.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
    const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month % 12, 1))
      .toISOString()
      .slice(0, 10);
    query = query.gte("occurred_on", start).lt("occurred_on", end);
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
