"use server";

import { createClient } from "@/lib/supabase/server";
import { getLastIncomeDate, getMonthSummary } from "@/lib/data/dashboard";
import { matchIntent } from "@/lib/assistant";
import { formatMoney } from "@/lib/format";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function askAssistant(question: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Log in to ask about your numbers.";

  const intent = matchIntent(question);
  const month = currentMonth();

  switch (intent) {
    case "profit_this_month": {
      const summary = await getMonthSummary(supabase, user.id, month);
      const verdict = summary.net >= 0 ? "You're in the black" : "You're currently in the red";
      return `${verdict} this month: ${formatMoney(summary.income)} income minus ${formatMoney(
        summary.expense
      )} expenses = ${formatMoney(summary.net)} net.`;
    }
    case "biggest_expense": {
      const summary = await getMonthSummary(supabase, user.id, month);
      const entries = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) return "No expenses logged this month yet — nice.";
      const [category, amount] = entries[0];
      return `Your biggest expense this month is ${category} at ${formatMoney(amount)}.`;
    }
    case "unpaid_invoices": {
      type UnpaidInvoice = {
        invoice_number: string;
        client_name: string;
        invoice_items: { quantity: number; unit_price: number }[] | null;
      };
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number, client_name, status, invoice_items(quantity, unit_price)")
        .eq("user_id", user.id)
        .in("status", ["draft", "sent"]);
      if (error) return "Couldn't check your invoices right now.";
      if (!data || data.length === 0) return "No unpaid invoices — you're all caught up.";
      const invoices = data as unknown as UnpaidInvoice[];
      const total = invoices.reduce((sum, inv) => {
        const items = inv.invoice_items ?? [];
        return sum + items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
      }, 0);
      const names = invoices.map((inv) => `${inv.invoice_number} (${inv.client_name})`).join(", ");
      return `You have ${invoices.length} unpaid invoice${invoices.length === 1 ? "" : "s"} totalling ${formatMoney(
        total
      )}: ${names}.`;
    }
    case "top_income_category": {
      const summary = await getMonthSummary(supabase, user.id, month);
      const byCategory: Record<string, number> = {};
      for (const t of summary.transactions) {
        if (t.type === "income") byCategory[t.category] = (byCategory[t.category] ?? 0) + Number(t.amount);
      }
      const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) return "No income logged this month yet.";
      const [category, amount] = entries[0];
      return `${category} is your top income source this month at ${formatMoney(amount)}.`;
    }
    case "breakeven": {
      const summary = await getMonthSummary(supabase, user.id, month);
      if (summary.net >= 0) return `You're already past breakeven by ${formatMoney(summary.net)} this month.`;
      return `You need ${formatMoney(Math.abs(summary.net))} more in sales this month to hit breakeven.`;
    }
    case "days_since_sale": {
      const last = await getLastIncomeDate(supabase, user.id);
      if (!last) return "No income logged yet.";
      const days = Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000);
      return days === 0 ? "You logged a sale today." : `${days} day${days === 1 ? "" : "s"} since your last logged sale (${last}).`;
    }
    default:
      return "I can answer questions about profit, biggest expense, unpaid invoices, top income category, breakeven, and your last sale. Try one of the quick actions below.";
  }
}
