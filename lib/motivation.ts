const MESSAGES = [
  "Every 3D printing business has slow months — what matters is what you do next, not this one number.",
  "You're building something real. A red month is a data point, not a verdict.",
  "Printers jam, filament snaps, but businesses that stick around are the ones that keep printing anyway.",
  "This is the month you course-correct, not the month you quit. Small moves compound.",
  "Cash flow dips happen to every maker business — Etsy shops, Shopify stores, all of them. You're in good company.",
  "You already did the hard part: you're tracking this instead of avoiding it. That's how you get ahead of it.",
  "One tough month doesn't undo the ones you'll print your way back from.",
];

export function pickMotivationMessage(excludeIndex?: number): { message: string; index: number } {
  let index = Math.floor(Math.random() * MESSAGES.length);
  if (MESSAGES.length > 1 && index === excludeIndex) {
    index = (index + 1) % MESSAGES.length;
  }
  return { message: MESSAGES[index], index };
}

export interface MotivationTip {
  label: string;
  detail: string;
}

export function buildTip(params: {
  topExpenseCategory: string | null;
  topExpenseAmount: number;
  netDeficit: number;
  lastIncomeDate: string | null;
}): MotivationTip {
  const { topExpenseCategory, topExpenseAmount, netDeficit, lastIncomeDate } = params;

  if (lastIncomeDate) {
    const days = Math.floor((Date.now() - new Date(lastIncomeDate).getTime()) / 86_400_000);
    if (days >= 10) {
      return {
        label: "It's been a while since your last sale",
        detail: `${days} days since your last logged sale. A limited-time discount code or a restock post on your Shopify store can jump-start momentum.`,
      };
    }
  }

  if (topExpenseCategory && topExpenseAmount > 0) {
    return {
      label: `${topExpenseCategory} is your biggest expense this month`,
      detail: `You've spent $${topExpenseAmount.toFixed(
        2
      )} on ${topExpenseCategory.toLowerCase()} so far. Worth checking if there's a cheaper supplier or a bulk-buy discount.`,
    };
  }

  return {
    label: "You're close to breakeven",
    detail: `You need about $${Math.abs(netDeficit).toFixed(
      2
    )} more in sales this month to hit $0. That's roughly one or two extra orders.`,
  };
}
