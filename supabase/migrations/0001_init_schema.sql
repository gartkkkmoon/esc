-- Broker's Title & Escrow — core schema
-- Enums, tables, and helper functions. RLS policies live in 0002_rls.sql.

create extension if not exists pgcrypto;

-- ========== ENUMS ==========

create type user_role as enum ('buyer', 'seller', 'admin', 'compliance', 'mediator');
create type kyc_status as enum ('not_required', 'required', 'pending', 'approved', 'rejected', 'needs_more_info');
create type account_status as enum ('active', 'disabled', 'suspended', 'pending');

create type contract_status as enum (
  'draft', 'waiting_for_seller', 'seller_joined', 'seller_accepted',
  'waiting_for_deposit', 'deposit_pending', 'blockchain_confirming', 'deposit_confirmed',
  'admin_reviewing', 'active_escrow', 'awaiting_delivery', 'delivery_completed',
  'release_requested', 'admin_reviewing_release', 'released', 'completed',
  'cancelled', 'refunded', 'disputed', 'under_mediation', 'resolved', 'closed'
);

create type payment_status as enum ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'released');

create type contract_type as enum ('crypto', 'real_estate');

create type participant_role as enum ('buyer', 'seller', 'escrow_officer', 'mediator', 'compliance', 'observer');

create type message_type as enum ('buyer', 'seller', 'admin', 'mediator', 'compliance', 'system');

create type dispute_status as enum ('open', 'under_review', 'mediation', 'settlement_proposed', 'resolved', 'closed');

create type admin_action_type as enum (
  'mark_deposit_confirmed', 'mark_pending', 'mark_payment_failed', 'mark_paid', 'mark_unpaid',
  'mark_complete', 'mark_incomplete', 'release_funds', 'refund_funds', 'pause_contract',
  'cancel_contract', 'lock_contract', 'unlock_contract', 'open_dispute', 'assign_mediator',
  'request_documents', 'add_internal_note', 'verify_user', 'unverify_user', 'enable_user',
  'disable_user', 'suspend_user', 'reactivate_user', 'approve_kyc', 'reject_kyc',
  'request_more_kyc_info', 'create_contract', 'edit_contract', 'reset_password',
  'join_chat', 'send_official_message', 'propose_settlement', 'close_dispute'
);

create type crypto_asset as enum ('BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'LTC');

-- ========== TABLES ==========

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  account_status account_status not null default 'active',
  is_verified boolean not null default false,
  kyc_status kyc_status not null default 'not_required',
  risk_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role user_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status kyc_status not null default 'pending',
  id_document_url text,
  passport_url text,
  national_id_url text,
  proof_of_address_url text,
  selfie_url text,
  liveness_check_url text,
  compliance_notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table escrow_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique default ('ESC-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random() * 100000))::text, 5, '0')),
  contract_type contract_type not null default 'crypto',
  title text not null,
  description text,
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  escrow_officer_id uuid references profiles(id),
  mediator_id uuid references profiles(id),
  crypto_asset crypto_asset,
  amount_crypto numeric(20, 8),
  amount_usd numeric(14, 2) not null default 0,
  payment_network text,
  deposit_address text,
  transaction_hash text,
  confirmations int not null default 0,
  status contract_status not null default 'draft',
  payment_status payment_status not null default 'unpaid',
  kyc_requirement kyc_status not null default 'not_required',
  delivery_terms text,
  inspection_period text,
  release_conditions text,
  dispute_terms text,
  is_locked boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contract_participants (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role participant_role not null,
  joined_at timestamptz not null default now(),
  unique (contract_id, user_id, role)
);

create table contract_invites (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  seller_email text not null,
  invited_by uuid references profiles(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references profiles(id),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table contract_messages (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  sender_id uuid references profiles(id),
  message_type message_type not null,
  body text not null,
  is_official boolean not null default false,
  read_by uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references contract_messages(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_size int,
  created_at timestamptz not null default now()
);

create table contract_documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  uploaded_by uuid references profiles(id),
  file_url text not null,
  file_name text not null,
  document_type text,
  created_at timestamptz not null default now()
);

create table contract_payments (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  payment_status payment_status not null default 'unpaid',
  amount_crypto numeric(20, 8),
  crypto_asset crypto_asset,
  amount_usd numeric(14, 2),
  transaction_hash text,
  confirmations int not null default 0,
  submitted_by uuid references profiles(id),
  confirmed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wallet_addresses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references escrow_contracts(id) on delete cascade,
  crypto_asset crypto_asset not null,
  address text not null,
  network text,
  label text,
  is_platform_wallet boolean not null default true,
  created_at timestamptz not null default now()
);

create table contract_timeline_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  actor_id uuid references profiles(id),
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references escrow_contracts(id) on delete cascade,
  opened_by uuid references profiles(id),
  mediator_id uuid references profiles(id),
  status dispute_status not null default 'open',
  reason text not null,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references disputes(id) on delete cascade,
  sender_id uuid references profiles(id),
  message_type message_type not null,
  body text not null,
  is_official boolean not null default false,
  created_at timestamptz not null default now()
);

create table settlement_proposals (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references disputes(id) on delete cascade,
  proposed_by uuid references profiles(id),
  buyer_amount_usd numeric(14, 2) not null default 0,
  seller_amount_usd numeric(14, 2) not null default 0,
  notes text,
  status text not null default 'pending',
  buyer_response text,
  seller_response text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table admin_notes (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references escrow_contracts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  author_id uuid references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  actor_role user_role,
  action admin_action_type not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  reason text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ========== HELPER FUNCTIONS ==========

create or replace function is_admin(uid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from user_roles where user_id = uid and role = 'admin'
  );
$$;

create or replace function has_role(uid uuid, r user_role)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from user_roles where user_id = uid and role = r
  );
$$;

create or replace function is_contract_participant(cid uuid, uid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from contract_participants where contract_id = cid and user_id = uid
  ) or exists (
    select 1 from escrow_contracts where id = cid and (buyer_id = uid or seller_id = uid)
  );
$$;

-- ========== DEFAULT SETTINGS ==========

insert into platform_settings (key, value) values
  ('kyc_threshold_usd', '100'),
  ('supported_crypto_assets', '["BTC","ETH","USDT","USDC","SOL","XRP","LTC"]'),
  ('invite_link_expiration_days', '7'),
  ('platform_fee_percent', '1.0')
on conflict (key) do nothing;
