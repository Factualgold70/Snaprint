import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncShopifyOrdersForUser } from "@/lib/shopify";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: settings, error } = await supabase.from("shopify_settings").select("user_id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (settings ?? []).map((s) => syncShopifyOrdersForUser(supabase, s.user_id))
  );

  const summary = results.map((r, i) => ({
    user_id: settings![i].user_id,
    ok: r.status === "fulfilled",
    ...(r.status === "fulfilled" ? r.value : { error: r.reason?.message ?? "unknown error" }),
  }));

  return NextResponse.json({ synced: summary.length, results: summary });
}
