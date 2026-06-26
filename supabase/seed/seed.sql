-- Demo seed data for Broker's Title & Escrow.
-- Run after the auth users below already exist in Supabase Auth (auth.users),
-- since profiles/user_roles are normally created by the on_auth_user_created
-- trigger. This script assumes you have created these auth users first
-- (e.g. via the Supabase dashboard or supabase auth admin API) with these
-- emails, then replace the UUIDs below with the real auth.users.id values.
--
-- admin@brokerstitle.test      -> ADMIN_ID
-- mediator@brokerstitle.test   -> MEDIATOR_ID
-- buyer@brokerstitle.test      -> BUYER_ID
-- seller@brokerstitle.test     -> SELLER_ID

do $$
declare
  admin_id uuid := '00000000-0000-0000-0000-000000000001';
  mediator_id uuid := '00000000-0000-0000-0000-000000000002';
  buyer_id uuid := '00000000-0000-0000-0000-000000000003';
  seller_id uuid := '00000000-0000-0000-0000-000000000004';
  contract_active uuid := gen_random_uuid();
  contract_disputed uuid := gen_random_uuid();
  contract_waiting uuid := gen_random_uuid();
  dispute_id uuid := gen_random_uuid();
begin
  -- Roles (profiles are assumed to already exist via the auth trigger)
  update public.profiles set full_name = 'Ada Admin', is_verified = true, account_status = 'active' where id = admin_id;
  update public.profiles set full_name = 'Mira Mediator', is_verified = true, account_status = 'active' where id = mediator_id;
  update public.profiles set full_name = 'Brian Buyer', is_verified = true, account_status = 'active', kyc_status = 'approved' where id = buyer_id;
  update public.profiles set full_name = 'Sara Seller', is_verified = true, account_status = 'active', kyc_status = 'approved' where id = seller_id;

  insert into public.user_roles (user_id, role)
  values (admin_id, 'admin'), (mediator_id, 'mediator')
  on conflict do nothing;

  -- Active escrow contract, deposit confirmed, both parties joined
  insert into public.escrow_contracts (
    id, buyer_id, seller_id, title, description, contract_type, crypto_asset,
    amount_crypto, amount_usd, status, payment_status, kyc_requirement, deposit_address
  ) values (
    contract_active, buyer_id, seller_id, 'Vintage Watch Purchase',
    'Sale of a vintage Rolex Submariner, authenticated copy of papers included.',
    'crypto', 'btc', 0.0021, 145.00, 'active_escrow', 'paid', 'required',
    'bc1qexampledepositaddressxxxxxxxxxxxxxxxx'
  );
  insert into public.contract_participants (contract_id, user_id, role) values
    (contract_active, buyer_id, 'buyer'),
    (contract_active, seller_id, 'seller');

  -- Disputed contract under mediation
  insert into public.escrow_contracts (
    id, buyer_id, seller_id, title, description, contract_type, crypto_asset,
    amount_crypto, amount_usd, status, payment_status, kyc_requirement, mediator_id
  ) values (
    contract_disputed, buyer_id, seller_id, 'Custom Furniture Order',
    'Buyer alleges item received does not match agreed specification.',
    'crypto', 'usdc', 1200.00, 1200.00, 'under_mediation', 'paid', 'required', mediator_id
  );
  insert into public.contract_participants (contract_id, user_id, role) values
    (contract_disputed, buyer_id, 'buyer'),
    (contract_disputed, seller_id, 'seller');
  insert into public.disputes (id, contract_id, opened_by, mediator_id, reason, status)
  values (dispute_id, contract_disputed, buyer_id, mediator_id,
    'Item delivered does not match agreed specification; requesting partial refund.', 'mediation');

  -- Waiting-for-seller contract, no KYC needed (under $100)
  insert into public.escrow_contracts (
    id, buyer_id, title, description, contract_type, crypto_asset,
    amount_crypto, amount_usd, status, payment_status, kyc_requirement
  ) values (
    contract_waiting, buyer_id, 'Graphic Design Commission',
    'Logo and brand kit design, delivered as source files.',
    'crypto', 'usdt', 75.00, 75.00, 'waiting_for_seller', 'unpaid', 'not_required'
  );
  insert into public.contract_participants (contract_id, user_id, role) values
    (contract_waiting, buyer_id, 'buyer');
  insert into public.contract_invites (contract_id, email, invited_by)
  values (contract_waiting, 'seller@brokerstitle.test', buyer_id);

  -- Platform wallets
  insert into public.wallet_addresses (crypto_asset, address, network, label, is_platform_wallet) values
    ('btc', 'bc1qplatformwalletexamplexxxxxxxxxxxxxxxx', 'mainnet', 'Platform BTC Hot Wallet', true),
    ('usdc', '0xPlatformWalletExamplexxxxxxxxxxxxxxxxxxxx', 'ethereum', 'Platform USDC Wallet', true),
    ('usdt', '0xPlatformWalletExampleUsdtxxxxxxxxxxxxxxxx', 'ethereum', 'Platform USDT Wallet', true);

  -- KYC submission pending review
  insert into public.kyc_submissions (user_id, status, id_document_url, proof_of_address_url, selfie_url)
  values (buyer_id, 'approved', 'https://example.com/docs/buyer-id.jpg',
    'https://example.com/docs/buyer-address.jpg', 'https://example.com/docs/buyer-selfie.jpg');

  -- Timeline events
  insert into public.contract_timeline_events (contract_id, actor_id, event_type, description) values
    (contract_active, buyer_id, 'contract_created', 'Contract created by buyer.'),
    (contract_active, seller_id, 'seller_joined', 'Seller accepted invite and joined the contract.'),
    (contract_active, admin_id, 'deposit_confirmed', 'Admin confirmed blockchain deposit.'),
    (contract_disputed, buyer_id, 'dispute_opened', 'Buyer opened a dispute.');

  -- Audit log sample
  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, reason) values
    (admin_id, 'admin', 'mark_deposit_confirmed', 'escrow_contract', contract_active, 'Confirmed 3 blockchain confirmations on-chain.');
end $$;
