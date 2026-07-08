-- SnapPrint schema. Run this once in the Supabase SQL Editor for your project.

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null default 'Other',
  description text not null default '',
  occurred_on date not null default current_date,
  source text not null default 'manual' check (source in ('manual', 'shopify', 'invoice')),
  shopify_order_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists transactions_user_shopify_order_unique
  on transactions (user_id, shopify_order_id)
  where shopify_order_id is not null;

create index if not exists transactions_user_date_idx on transactions (user_id, occurred_on desc);

alter table transactions enable row level security;

create policy "transactions_select_own" on transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on transactions
  for delete using (auth.uid() = user_id);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_number text not null,
  client_name text not null,
  client_email text not null default '',
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  notes text not null default '',
  tax_rate numeric(5, 2) not null default 0,
  transaction_id uuid references transactions (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists invoices_user_number_unique on invoices (user_id, invoice_number);

alter table invoices enable row level security;

create policy "invoices_select_own" on invoices
  for select using (auth.uid() = user_id);
create policy "invoices_insert_own" on invoices
  for insert with check (auth.uid() = user_id);
create policy "invoices_update_own" on invoices
  for update using (auth.uid() = user_id);
create policy "invoices_delete_own" on invoices
  for delete using (auth.uid() = user_id);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  position int not null default 0
);

alter table invoice_items enable row level security;

create policy "invoice_items_select_own" on invoice_items
  for select using (
    exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid())
  );
create policy "invoice_items_insert_own" on invoice_items
  for insert with check (
    exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid())
  );
create policy "invoice_items_update_own" on invoice_items
  for update using (
    exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid())
  );
create policy "invoice_items_delete_own" on invoice_items
  for delete using (
    exists (select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid())
  );

create table if not exists shopify_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  shop_domain text not null,
  access_token text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table shopify_settings enable row level security;

create policy "shopify_settings_all_own" on shopify_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists filaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '',
  material text not null default 'PLA',
  weight_grams numeric(10, 2) not null check (weight_grams > 0),
  cost_zar numeric(12, 2) not null check (cost_zar > 0),
  cost_rmb numeric(12, 2),
  rmb_to_zar_rate numeric(10, 4),
  used_grams numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists filaments_user_idx on filaments (user_id);

alter table filaments enable row level security;

create policy "filaments_select_own" on filaments
  for select using (auth.uid() = user_id);
create policy "filaments_insert_own" on filaments
  for insert with check (auth.uid() = user_id);
create policy "filaments_update_own" on filaments
  for update using (auth.uid() = user_id);
create policy "filaments_delete_own" on filaments
  for delete using (auth.uid() = user_id);

create table if not exists filament_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  filament_id uuid not null references filaments (id) on delete cascade,
  grams_used numeric(10, 2) not null check (grams_used > 0),
  print_description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists filament_usage_user_idx on filament_usage (user_id);
create index if not exists filament_usage_filament_idx on filament_usage (filament_id);

alter table filament_usage enable row level security;

create policy "filament_usage_select_own" on filament_usage
  for select using (auth.uid() = user_id);
create policy "filament_usage_insert_own" on filament_usage
  for insert with check (auth.uid() = user_id);
create policy "filament_usage_delete_own" on filament_usage
  for delete using (auth.uid() = user_id);
