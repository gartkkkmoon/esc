-- Demo accounts for manual walkthrough testing.
--
-- Prerequisite: create all four auth users first via Supabase dashboard
-- (Authentication -> Users -> Add User), with "Auto Confirm User" checked,
-- all with password 1234567890:
--   admin@escrow.it
--   buyer@escrow.it
--   seller@escrow.it
--   nokyc@escrow.it
--
-- Then run this script in the SQL Editor. It looks up the UUIDs by email,
-- so no manual ID copying is required.

do $$
declare
  admin_id uuid;
  buyer_id uuid;
  seller_id uuid;
  nokyc_id uuid;
  contract_1 uuid := gen_random_uuid();
  contract_2 uuid := gen_random_uuid();
begin
  select id into admin_id from auth.users where email = 'admin@escrow.it';
  select id into buyer_id from auth.users where email = 'buyer@escrow.it';
  select id into seller_id from auth.users where email = 'seller@escrow.it';
  select id into nokyc_id from auth.users where email = 'nokyc@escrow.it';

  if admin_id is null then
    raise exception 'auth user admin@escrow.it not found - create it in the Supabase dashboard first';
  end if;
  if buyer_id is null then
    raise exception 'auth user buyer@escrow.it not found - create it in the Supabase dashboard first';
  end if;
  if seller_id is null then
    raise exception 'auth user seller@escrow.it not found - create it in the Supabase dashboard first';
  end if;
  if nokyc_id is null then
    raise exception 'auth user nokyc@escrow.it not found - create it in the Supabase dashboard first';
  end if;

  -- Admin: admin role, verified, KYC approved
  update public.profiles
    set full_name = 'Site Administrator', is_verified = true, account_status = 'active', kyc_status = 'approved'
    where id = admin_id;
  insert into public.user_roles (user_id, role) values (admin_id, 'admin') on conflict do nothing;

  -- Buyer: verified, KYC approved (buyer role already granted by the signup trigger)
  update public.profiles
    set full_name = 'Morgan Buyer', is_verified = true, account_status = 'active', kyc_status = 'approved'
    where id = buyer_id;
  insert into public.user_roles (user_id, role) values (buyer_id, 'buyer') on conflict do nothing;

  -- Seller: verified, KYC approved, explicit seller role
  update public.profiles
    set full_name = 'Jordan Seller', is_verified = true, account_status = 'active', kyc_status = 'approved'
    where id = seller_id;
  insert into public.user_roles (user_id, role) values (seller_id, 'seller') on conflict do nothing;

  -- No-KYC account: verified login, but KYC intentionally not completed
  update public.profiles
    set full_name = 'No KYC Test User', is_verified = true, account_status = 'active', kyc_status = 'required'
    where id = nokyc_id;
  insert into public.user_roles (user_id, role) values (nokyc_id, 'buyer') on conflict do nothing;

  -- Approved KYC submissions for buyer and seller
  insert into public.kyc_submissions (
    user_id, status, id_document_url, proof_of_address_url, selfie_url,
    compliance_notes, reviewed_by, reviewed_at
  ) values
    (buyer_id, 'approved', buyer_id::text || '/id-document-mock.jpg',
      buyer_id::text || '/proof-of-address-mock.jpg', buyer_id::text || '/selfie-mock.jpg',
      'Identity and address verified.', admin_id, now() - interval '20 days'),
    (seller_id, 'approved', seller_id::text || '/id-document-mock.jpg',
      seller_id::text || '/proof-of-address-mock.jpg', seller_id::text || '/selfie-mock.jpg',
      'Identity and address verified.', admin_id, now() - interval '20 days');

  -- Completed contract #1: crypto sale, fully released, between buyer@escrow.it and seller@escrow.it
  insert into public.escrow_contracts (
    id, buyer_id, seller_id, title, description, contract_type, crypto_asset,
    amount_crypto, amount_usd, status, payment_status, kyc_requirement,
    transaction_hash, confirmations, created_by
  ) values (
    contract_1, buyer_id, seller_id, 'Mining Rig Sale - 3x ASIC Units',
    'Sale of three used ASIC mining units, tested and verified working condition prior to shipment.',
    'crypto', 'BTC', 0.18500000, 12500.00, 'completed', 'released', 'required',
    '3a7f9c2e1b6d4f8e0a5c9b2d7e1f4a6c8b3d5e7f9a1c3e5b7d9f1a3c5e7b9d1f', 6, buyer_id
  );
  insert into public.contract_participants (contract_id, user_id, role) values
    (contract_1, buyer_id, 'buyer'),
    (contract_1, seller_id, 'seller');
  insert into public.contract_timeline_events (contract_id, actor_id, event_type, description, created_at) values
    (contract_1, buyer_id, 'contract_created', 'Contract created by buyer.', now() - interval '30 days'),
    (contract_1, seller_id, 'seller_joined', 'Seller accepted invite and joined the contract.', now() - interval '29 days'),
    (contract_1, buyer_id, 'deposit_submitted', 'Buyer submitted blockchain deposit.', now() - interval '28 days'),
    (contract_1, admin_id, 'deposit_confirmed', 'Admin confirmed blockchain deposit with 6 confirmations.', now() - interval '27 days'),
    (contract_1, seller_id, 'delivery_completed', 'Seller marked delivery as complete and shipped units.', now() - interval '25 days'),
    (contract_1, admin_id, 'release_funds', 'Admin released funds to seller after delivery confirmation.', now() - interval '24 days'),
    (contract_1, admin_id, 'mark_complete', 'Contract marked complete and closed.', now() - interval '24 days');

  -- Completed contract #2: real estate earnest money deposit, fully released
  insert into public.escrow_contracts (
    id, buyer_id, seller_id, title, description, contract_type,
    amount_usd, status, payment_status, kyc_requirement, created_by
  ) values (
    contract_2, buyer_id, seller_id, 'Earnest Money Deposit - 142 Sycamore Ave',
    'Earnest money escrow for residential purchase agreement, released to seller at closing.',
    'real_estate', 8500.00, 'completed', 'released', 'required', buyer_id
  );
  insert into public.contract_participants (contract_id, user_id, role) values
    (contract_2, buyer_id, 'buyer'),
    (contract_2, seller_id, 'seller');
  insert into public.contract_timeline_events (contract_id, actor_id, event_type, description, created_at) values
    (contract_2, buyer_id, 'contract_created', 'Contract created by buyer.', now() - interval '60 days'),
    (contract_2, seller_id, 'seller_joined', 'Seller accepted invite and joined the contract.', now() - interval '59 days'),
    (contract_2, buyer_id, 'deposit_submitted', 'Buyer wired earnest money to escrow.', now() - interval '55 days'),
    (contract_2, admin_id, 'deposit_confirmed', 'Admin confirmed receipt of funds.', now() - interval '54 days'),
    (contract_2, admin_id, 'release_funds', 'Funds released to seller at closing.', now() - interval '40 days'),
    (contract_2, admin_id, 'mark_complete', 'Contract marked complete and closed.', now() - interval '40 days');

  -- Audit log entries for the completed actions
  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, reason) values
    (admin_id, 'admin', 'release_funds', 'escrow_contract', contract_1, 'Delivery confirmed by both parties; funds released per contract terms.'),
    (admin_id, 'admin', 'mark_complete', 'escrow_contract', contract_1, 'All conditions satisfied; closing out contract.'),
    (admin_id, 'admin', 'release_funds', 'escrow_contract', contract_2, 'Closing confirmed by title company; earnest money released to seller.'),
    (admin_id, 'admin', 'mark_complete', 'escrow_contract', contract_2, 'Transaction closed successfully.'),
    (admin_id, 'admin', 'approve_kyc', 'profile', buyer_id, 'Identity and proof of address documents verified.'),
    (admin_id, 'admin', 'approve_kyc', 'profile', seller_id, 'Identity and proof of address documents verified.');
end $$;
