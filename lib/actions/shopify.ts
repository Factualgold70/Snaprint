"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncShopifyOrdersForUser } from "@/lib/shopify";

export async function saveShopifySettings(shopDomain: string, accessToken: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("shopify_settings")
    .upsert({ user_id: user.id, shop_domain: shopDomain, access_token: accessToken });
  if (error) throw new Error(error.message);

  revalidatePath("/settings/shopify");
}

export async function disconnectShopify() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("shopify_settings").delete().eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings/shopify");
}

export async function runShopifySync(): Promise<{ message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const result = await syncShopifyOrdersForUser(supabase, user.id);

  revalidatePath("/settings/shopify");
  revalidatePath("/transactions");
  revalidatePath("/");

  return {
    message: `Checked ${result.fetched} paid order${result.fetched === 1 ? "" : "s"}, imported ${result.imported} new one${
      result.imported === 1 ? "" : "s"
    }.`,
  };
}
