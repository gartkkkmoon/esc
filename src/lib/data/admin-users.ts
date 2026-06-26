"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/data/audit";
import type { AdminActionType, AccountStatus, KycStatus } from "@/lib/supabase/types";

const ACCOUNT_STATUS_ACTIONS: Partial<Record<AdminActionType, AccountStatus>> = {
  enable_user: "active",
  disable_user: "disabled",
  suspend_user: "suspended",
  reactivate_user: "active",
};

const KYC_STATUS_ACTIONS: Partial<Record<AdminActionType, KycStatus>> = {
  approve_kyc: "approved",
  reject_kyc: "rejected",
  request_more_kyc_info: "needs_more_info",
};

export async function performUserActionAction(userId: string, action: AdminActionType, formData: FormData) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    redirect(`/admin/users/${userId}?error=${encodeURIComponent("A reason is required for this action.")}`);
  }

  const supabase = await createClient();
  const { data: before } = await supabase.from("profiles").select("*").eq("id", userId).single();

  const update: Record<string, unknown> = {};
  if (action === "verify_user") update.is_verified = true;
  if (action === "unverify_user") update.is_verified = false;
  if (ACCOUNT_STATUS_ACTIONS[action]) update.account_status = ACCOUNT_STATUS_ACTIONS[action];
  if (KYC_STATUS_ACTIONS[action]) update.kyc_status = KYC_STATUS_ACTIONS[action];

  if (Object.keys(update).length > 0) {
    await supabase.from("profiles").update(update).eq("id", userId);
  }

  if (KYC_STATUS_ACTIONS[action]) {
    const { data: latestSubmission } = await supabase
      .from("kyc_submissions")
      .select("id")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestSubmission) {
      await supabase
        .from("kyc_submissions")
        .update({
          status: KYC_STATUS_ACTIONS[action],
          reviewed_by: authId,
          reviewed_at: new Date().toISOString(),
          compliance_notes: reason,
        })
        .eq("id", latestSubmission.id);
    }
  }

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action,
    entityType: "profile",
    entityId: userId,
    oldValue: before ?? null,
    newValue: update,
    reason,
  });

  const note = String(formData.get("internal_note") ?? "").trim();
  if (note) {
    await supabase.from("admin_notes").insert({ user_id: userId, author_id: authId, body: note });
  }

  redirect(`/admin/users/${userId}`);
}
