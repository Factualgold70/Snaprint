# SnapPrint

Income/expense tracking, invoicing, Shopify sync, and Excel export for a 3D printing business. Built with Next.js 16 + Supabase, deployable to Vercel for phone + laptop access.

## 1. Create a Supabase project (~3 min)

1. Go to [supabase.com](https://supabase.com), sign up (free), and create a new project.
2. Wait for it to finish provisioning, then open **SQL Editor** and paste the contents of [`supabase/schema.sql`](supabase/schema.sql). Run it — this creates the `transactions`, `invoices`, `invoice_items`, and `shopify_settings` tables with row-level security so your data is private to your account.
3. Go to **Project Settings → API**. You'll need three values for the next step:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (click "Reveal") — keep this secret, never share it or put it in client-side code.
4. Go to **Authentication → Sign In / Providers** and make sure **Email** is enabled (it is by default). Optionally turn off "Confirm email" under Authentication → Settings if you want to log in immediately after signup without checking your inbox.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the three Supabase values above, plus a `CRON_SECRET` (any random string — used to authenticate the scheduled Shopify sync and monthly export jobs).

```bash
cp .env.local.example .env.local
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign up, and you're in.

## 4. Connect Shopify (optional, in-app)

Once logged in, go to **Shopify** in the nav bar — the page walks you through creating a custom app in your Shopify admin and pasting in the access token. Click "Sync now" any time, or let the daily cron job (see below) handle it automatically once deployed.

## 5. Deploy to Vercel (so it's usable on your phone)

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Add the same environment variables from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`) in the Vercel project's **Settings → Environment Variables**.
4. Deploy. Vercel will automatically pick up `vercel.json`, which schedules:
   - Daily Shopify order sync (8am UTC)
   - Monthly export pre-generation on the 1st (9am UTC), stored in Supabase Storage
5. Open the deployed URL on your phone and tap "Add to Home Screen" (Safari: Share → Add to Home Screen; Android Chrome: menu → Install app) for an app-like icon, thanks to the built-in PWA manifest.

## What's included

- **Dashboard** — this month's income/expenses/net, a 6-month trend chart, recent activity, and a motivation banner with a concrete, data-derived tip whenever the month is running negative.
- **Transactions** — manual income/expense entries with filtering by month and type.
- **Invoices** — line-item invoices with tax, PDF download, and "mark as paid" which automatically logs the income.
- **Shopify sync** — pulls paid orders in as income transactions, deduplicated, with a manual "Sync now" and a daily cron.
- **Excel export** — a button on the dashboard exports any month (Summary / Income / Expenses / Invoices sheets).
- **Assistant** — ask about profit, biggest expense, unpaid invoices, top income category, or your last sale; answers are computed directly from your data (no external AI cost). `lib/assistant.ts` and `lib/actions/assistant.ts` are the two files to touch if you later want to swap in a real LLM.
