"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export async function submitKycAction(formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();

  await supabase.from("kyc_submissions").insert({
    user_id: authId,
    status: "pending",
    id_document_url: String(formData.get("id_document_url") ?? "") || null,
    passport_url: String(formData.get("passport_url") ?? "") || null,
    proof_of_address_url: String(formData.get("proof_of_address_url") ?? "") || null,
    selfie_url: String(formData.get("selfie_url") ?? "") || null,
    liveness_check_url: String(formData.get("liveness_check_url") ?? "") || null,
  });

  await supabase.from("profiles").update({ kyc_status: "pending" }).eq("id", authId);

  redirect("/dashboard/kyc");
}
