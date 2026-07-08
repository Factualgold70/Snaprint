import { createClient } from "@/lib/supabase/server";
import { listTransactions } from "@/lib/data/transactions";
import TransactionsClient from "@/components/TransactionsClient";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string }>;
}) {
  const params = await searchParams;
  const month = params.month || currentMonth();
  const type = params.type === "income" || params.type === "expense" ? params.type : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const transactions = user
    ? await listTransactions(supabase, user.id, { month, type })
    : [];

  return (
    <TransactionsClient initialTransactions={transactions} month={month} type={type} />
  );
}
