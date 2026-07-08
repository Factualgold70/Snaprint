"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/supabase/types";

export type TransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  occurred_on: string;
};

export async function createTransaction(input: TransactionInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    category: input.category || "Other",
    description: input.description,
    occurred_on: input.occurred_on,
    source: "manual",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/assistant");
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update({
      type: input.type,
      amount: input.amount,
      category: input.category || "Other",
      description: input.description,
      occurred_on: input.occurred_on,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/assistant");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/assistant");
}
