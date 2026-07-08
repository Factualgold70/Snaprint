"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { disconnectShopify, runShopifySync, saveShopifySettings } from "@/lib/actions/shopify";

export default function ShopifySettingsClient({
  shopDomain,
  lastSyncedAt,
}: {
  shopDomain: string | null;
  lastSyncedAt: string | null;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(shopDomain ?? "");
  const [token, setToken] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await saveShopifySettings(domain, token);
        setToken("");
        setMessage("Shopify store connected.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  function handleSync() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await runShopifySync();
        setMessage(result.message);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sync failed.");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("Disconnect your Shopify store? Already-imported transactions stay.")) return;
    startTransition(async () => {
      await disconnectShopify();
      setDomain("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
        <h2 className="mb-2 text-sm font-medium">How to get a Shopify access token</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          <li>In your Shopify admin, go to Settings → Apps and sales channels → Develop apps.</li>
          <li>Click &ldquo;Allow custom app development&rdquo; (if prompted), then &ldquo;Create an app&rdquo; and name it SnapPrint.</li>
          <li>Under Configuration → Admin API scopes, enable <code>read_orders</code>.</li>
          <li>Go to the API credentials tab and click &ldquo;Install app&rdquo;.</li>
          <li>Copy the Admin API access token (starts with <code>shpat_</code>) — Shopify only shows it once.</li>
        </ol>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Shop domain
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="your-shop.myshopify.com"
            required
            className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Admin API access token
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={shopDomain ? "•••••••••• (leave blank to keep current)" : "shpat_..."}
            type="password"
            required={!shopDomain}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[#2a78d6] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {shopDomain ? "Update connection" : "Connect store"}
          </button>
          {shopDomain && (
            <>
              <button
                type="button"
                onClick={handleSync}
                disabled={isPending}
                className="rounded-md border border-[#c3c2b7] px-3 py-1.5 text-sm font-medium disabled:opacity-60"
              >
                Sync now
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isPending}
                className="rounded-md border border-[#d03b3b] px-3 py-1.5 text-sm font-medium text-[#d03b3b] disabled:opacity-60"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
        {message && <p className="text-sm text-[#006300]">{message}</p>}
        {error && <p className="text-sm text-[#d03b3b]">{error}</p>}
        {lastSyncedAt && (
          <p className="text-xs text-[#898781]">Last synced {new Date(lastSyncedAt).toLocaleString()}</p>
        )}
      </form>
    </div>
  );
}
