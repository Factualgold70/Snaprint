import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  created_at: string;
  total_price: string;
  financial_status: string;
  cancelled_at: string | null;
}

function normalizeShopDomain(input: string) {
  const trimmed = input.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return trimmed.includes(".") ? trimmed : `${trimmed}.myshopify.com`;
}

async function fetchOrders(shopDomain: string, accessToken: string): Promise<ShopifyOrder[]> {
  const domain = normalizeShopDomain(shopDomain);
  const url = `https://${domain}/admin/api/2024-10/orders.json?status=any&limit=100&order=created_at+desc`;

  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Shopify API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { orders: ShopifyOrder[] };
  return json.orders ?? [];
}

export interface SyncResult {
  fetched: number;
  imported: number;
}

export async function syncShopifyOrdersForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<SyncResult> {
  const { data: settings, error: settingsError } = await supabase
    .from("shopify_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (settingsError) throw new Error(settingsError.message);
  if (!settings) throw new Error("No Shopify store connected yet.");

  const orders = await fetchOrders(settings.shop_domain, settings.access_token);
  const paidOrders = orders.filter((o) => !o.cancelled_at && o.financial_status === "paid");

  let imported = 0;
  if (paidOrders.length > 0) {
    const rows = paidOrders.map((order) => ({
      user_id: userId,
      type: "income" as const,
      amount: Number(order.total_price),
      category: "Shopify Sales",
      description: `Shopify order ${order.name}`,
      occurred_on: order.created_at.slice(0, 10),
      source: "shopify" as const,
      shopify_order_id: String(order.id),
    }));

    const { error, count } = await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "user_id,shopify_order_id", ignoreDuplicates: true, count: "exact" });
    if (error) throw new Error(error.message);
    imported = count ?? 0;
  }

  await supabase
    .from("shopify_settings")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { fetched: paidOrders.length, imported };
}
