-- Row Level Security policies

alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table kyc_submissions enable row level security;
alter table escrow_contracts enable row level security;
alter table contract_participants enable row level security;
alter table contract_invites enable row level security;
alter table contract_messages enable row level security;
alter table message_attachments enable row level security;
alter table contract_documents enable row level security;
alter table contract_payments enable row level security;
alter table wallet_addresses enable row level security;
alter table contract_timeline_events enable row level security;
alter table disputes enable row level security;
alter table dispute_messages enable row level security;
alter table settlement_proposals enable row level security;
alter table admin_notes enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table platform_settings enable row level security;

-- profiles
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin(auth.uid()));
create policy "profiles_update_own_or_admin" on profiles for update
  using (id = auth.uid() or is_admin(auth.uid()));
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());

-- user_roles
create policy "user_roles_select_own_or_admin" on user_roles for select
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "user_roles_admin_write" on user_roles for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- kyc_submissions
create policy "kyc_select_own_or_staff" on kyc_submissions for select
  using (user_id = auth.uid() or is_admin(auth.uid()) or has_role(auth.uid(), 'compliance'));
create policy "kyc_insert_own" on kyc_submissions for insert
  with check (user_id = auth.uid());
create policy "kyc_update_staff_only" on kyc_submissions for update
  using (is_admin(auth.uid()) or has_role(auth.uid(), 'compliance'));

-- escrow_contracts: buyer/seller participants see their own; admin sees all
create policy "contracts_select_participant_or_admin" on escrow_contracts for select
  using (
    buyer_id = auth.uid() or seller_id = auth.uid()
    or is_contract_participant(id, auth.uid())
    or is_admin(auth.uid())
  );
create policy "contracts_insert_buyer_or_admin" on escrow_contracts for insert
  with check (buyer_id = auth.uid() or is_admin(auth.uid()));
-- Only admin may change payment/release/completion fields; buyers may edit drafts they own.
create policy "contracts_update_owner_draft" on escrow_contracts for update
  using (buyer_id = auth.uid() and status = 'draft')
  with check (buyer_id = auth.uid() and status = 'draft');
create policy "contracts_update_admin" on escrow_contracts for update
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- contract_participants
create policy "participants_select" on contract_participants for select
  using (user_id = auth.uid() or is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "participants_insert" on contract_participants for insert
  with check (user_id = auth.uid() or is_admin(auth.uid()));

-- contract_invites
create policy "invites_select_buyer_or_admin" on contract_invites for select
  using (invited_by = auth.uid() or is_admin(auth.uid()));
create policy "invites_insert_buyer_or_admin" on contract_invites for insert
  with check (invited_by = auth.uid() or is_admin(auth.uid()));
create policy "invites_update_admin" on contract_invites for update
  using (is_admin(auth.uid()) or invited_by = auth.uid());

-- contract_messages: participants + admin can read; both can write into contracts they belong to
create policy "messages_select" on contract_messages for select
  using (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "messages_insert_participant" on contract_messages for insert
  with check (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));

-- message_attachments
create policy "attachments_select" on message_attachments for select
  using (exists (
    select 1 from contract_messages m
    where m.id = message_id and (is_contract_participant(m.contract_id, auth.uid()) or is_admin(auth.uid()))
  ));
create policy "attachments_insert" on message_attachments for insert
  with check (exists (
    select 1 from contract_messages m
    where m.id = message_id and (is_contract_participant(m.contract_id, auth.uid()) or is_admin(auth.uid()))
  ));

-- contract_documents
create policy "documents_select" on contract_documents for select
  using (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "documents_insert" on contract_documents for insert
  with check (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));

-- contract_payments: participants can view; only admin can write status changes
create policy "payments_select" on contract_payments for select
  using (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "payments_insert_participant" on contract_payments for insert
  with check (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "payments_update_admin_only" on contract_payments for update
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- wallet_addresses
create policy "wallets_select" on wallet_addresses for select
  using (contract_id is null or is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "wallets_admin_write" on wallet_addresses for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- contract_timeline_events
create policy "timeline_select" on contract_timeline_events for select
  using (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "timeline_insert" on contract_timeline_events for insert
  with check (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));

-- disputes
create policy "disputes_select" on disputes for select
  using (
    is_contract_participant(contract_id, auth.uid())
    or is_admin(auth.uid())
    or mediator_id = auth.uid()
  );
create policy "disputes_insert" on disputes for insert
  with check (is_contract_participant(contract_id, auth.uid()) or is_admin(auth.uid()));
create policy "disputes_update_staff" on disputes for update
  using (is_admin(auth.uid()) or mediator_id = auth.uid());

-- dispute_messages
create policy "dispute_messages_select" on dispute_messages for select
  using (exists (
    select 1 from disputes d
    where d.id = dispute_id and (
      is_contract_participant(d.contract_id, auth.uid()) or is_admin(auth.uid()) or d.mediator_id = auth.uid()
    )
  ));
create policy "dispute_messages_insert" on dispute_messages for insert
  with check (exists (
    select 1 from disputes d
    where d.id = dispute_id and (
      is_contract_participant(d.contract_id, auth.uid()) or is_admin(auth.uid()) or d.mediator_id = auth.uid()
    )
  ));

-- settlement_proposals
create policy "settlements_select" on settlement_proposals for select
  using (exists (
    select 1 from disputes d
    where d.id = dispute_id and (
      is_contract_participant(d.contract_id, auth.uid()) or is_admin(auth.uid()) or d.mediator_id = auth.uid()
    )
  ));
create policy "settlements_insert" on settlement_proposals for insert
  with check (is_admin(auth.uid()) or exists (
    select 1 from disputes d where d.id = dispute_id and d.mediator_id = auth.uid()
  ));
create policy "settlements_update" on settlement_proposals for update
  using (exists (
    select 1 from disputes d
    where d.id = dispute_id and (
      is_contract_participant(d.contract_id, auth.uid()) or is_admin(auth.uid()) or d.mediator_id = auth.uid()
    )
  ));

-- admin_notes: staff only, never exposed to regular users
create policy "admin_notes_staff_only" on admin_notes for all
  using (is_admin(auth.uid()) or has_role(auth.uid(), 'compliance') or has_role(auth.uid(), 'mediator'))
  with check (is_admin(auth.uid()) or has_role(auth.uid(), 'compliance') or has_role(auth.uid(), 'mediator'));

-- audit_logs: staff read, system/admin insert; never editable
create policy "audit_logs_select_staff" on audit_logs for select
  using (is_admin(auth.uid()) or has_role(auth.uid(), 'compliance'));
create policy "audit_logs_insert_staff" on audit_logs for insert
  with check (is_admin(auth.uid()) or has_role(auth.uid(), 'compliance') or has_role(auth.uid(), 'mediator'));

-- notifications
create policy "notifications_select_own" on notifications for select
  using (user_id = auth.uid() or is_admin(auth.uid()));
create policy "notifications_update_own" on notifications for update
  using (user_id = auth.uid());
create policy "notifications_insert_admin" on notifications for insert
  with check (is_admin(auth.uid()));

-- platform_settings: readable by all authenticated, writable only by admin
create policy "settings_select_authenticated" on platform_settings for select
  using (auth.role() = 'authenticated');
create policy "settings_admin_write" on platform_settings for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
