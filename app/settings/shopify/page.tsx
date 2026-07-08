import { createClient } from "@/lib/supabase/server";
import ShopifySettingsClient from "@/components/ShopifySettingsClient";

export default async function ShopifySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: settings } = await supabase
    .from("shopify_settings")
    .select("shop_domain, last_synced_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Shopify</h1>
      <ShopifySettingsClient
        shopDomain={settings?.shop_domain ?? null}
        lastSyncedAt={settings?.last_synced_at ?? null}
      />
    </div>
  );
}
