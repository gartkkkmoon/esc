"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

const DOCUMENT_FIELDS = [
  "id_document",
  "passport",
  "proof_of_address",
  "selfie",
  "liveness_check",
] as const;

async function uploadKycFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authId: string,
  field: string,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop() || "bin";
  const path = `${authId}/${field}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("kyc-documents").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return null;
  return path;
}

export async function submitKycAction(formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();

  const uploaded: Record<string, string | null> = {};
  for (const field of DOCUMENT_FIELDS) {
    const file = formData.get(field) as File | null;
    uploaded[field] = file ? await uploadKycFile(supabase, authId, field, file) : null;
  }

  await supabase.from("kyc_submissions").insert({
    user_id: authId,
    status: "pending",
    id_document_url: uploaded.id_document,
    passport_url: uploaded.passport,
    proof_of_address_url: uploaded.proof_of_address,
    selfie_url: uploaded.selfie,
    liveness_check_url: uploaded.liveness_check,
  });

  await supabase.from("profiles").update({ kyc_status: "pending" }).eq("id", authId);

  redirect("/dashboard/kyc");
}
