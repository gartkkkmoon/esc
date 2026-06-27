-- Platform balances + manual-approval deposits, and crypto-pair exchange fields.

-- ===== Enums =====
do $$ begin
  create type balance_tx_type as enum ('deposit', 'withdrawal', 'exchange_debit', 'exchange_credit', 'adjustment');
exception when duplicate_object then null; end $$;

do $$ begin
  create type balance_tx_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ===== Per-user balance per asset =====
create table if not exists user_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  asset crypto_asset not null,
  amount numeric(20, 8) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, asset)
);

-- ===== Ledger of every balance movement (deposits, adjustments, exchange legs) =====
create table if not exists balance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  asset crypto_asset not null,
  amount numeric(20, 8) not null,            -- positive = credit, negative = debit
  tx_type balance_tx_type not null,
  status balance_tx_status not null default 'pending',
  contract_id uuid references escrow_contracts(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz
);

create index if not exists balance_tx_user_idx on balance_transactions (user_id);
create index if not exists balance_tx_status_idx on balance_transactions (status);

-- ===== Exchange-pair fields on contracts =====
-- deal_kind: 'goods' (existing one-sided delivery) or 'exchange' (crypto pair swap).
alter table escrow_contracts add column if not exists deal_kind text not null default 'goods';
alter table escrow_contracts add column if not exists pay_asset crypto_asset;       -- what the buyer pays (e.g. USDT)
alter table escrow_contracts add column if not exists pay_amount numeric(20, 8);
alter table escrow_contracts add column if not exists receive_asset crypto_asset;   -- what the buyer receives (e.g. BTC)
alter table escrow_contracts add column if not exists receive_amount numeric(20, 8);

-- ===== RLS: users can read their own balances/ledger; all writes go through the
-- service-role key in trusted server code (which bypasses RLS). =====
alter table user_balances enable row level security;
alter table balance_transactions enable row level security;

do $$ begin
  create policy "balances_select_own" on user_balances for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "balancetx_select_own" on balance_transactions for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
