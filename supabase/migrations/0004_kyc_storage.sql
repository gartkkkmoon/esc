-- Private storage bucket for KYC documents. Files are stored under
-- {user_id}/{filename} so RLS can scope access by folder name.
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "kyc_documents_owner_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "kyc_documents_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "kyc_documents_staff_read"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents'
    and (is_admin(auth.uid()) or has_role(auth.uid(), 'compliance'))
  );
