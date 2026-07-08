export type AssistantIntent =
  | "profit_this_month"
  | "biggest_expense"
  | "unpaid_invoices"
  | "top_income_category"
  | "breakeven"
  | "days_since_sale"
  | "unknown";

export const QUICK_ACTIONS: { label: string; question: string }[] = [
  { label: "Profit this month", question: "What's my profit this month?" },
  { label: "Biggest expense", question: "What's my biggest expense?" },
  { label: "Unpaid invoices", question: "Do I have any unpaid invoices?" },
  { label: "Top seller", question: "What's my top income category?" },
];

const RULES: { intent: AssistantIntent; patterns: RegExp[] }[] = [
  {
    intent: "profit_this_month",
    patterns: [/profit/i, /net income/i, /how (much|am i) (making|doing)/i, /doing this month/i],
  },
  {
    intent: "biggest_expense",
    patterns: [/biggest expense/i, /top expense/i, /spending (the )?most/i, /costing me/i],
  },
  {
    intent: "unpaid_invoices",
    patterns: [/unpaid/i, /outstanding invoice/i, /invoices? (still )?owe/i, /who owes me/i],
  },
  {
    intent: "top_income_category",
    patterns: [/top seller/i, /top (income|product|category)/i, /best.?selling/i, /selling well/i],
  },
  {
    intent: "breakeven",
    patterns: [/break ?even/i, /distance to (zero|breakeven)/i],
  },
  {
    intent: "days_since_sale",
    patterns: [/last sale/i, /last order/i, /when did i last sell/i],
  },
];

export function matchIntent(question: string): AssistantIntent {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(question))) return rule.intent;
  }
  return "unknown";
}
