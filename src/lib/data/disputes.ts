"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth/session";
import { logAdminAction, addTimelineEvent } from "@/lib/data/audit";

export async function sendDisputeMessageAction(
  disputeId: string,
  messageType: "buyer" | "seller" | "admin" | "mediator",
  formData: FormData
) {
  const { authId } = await requireUser();
  const supabase = await createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await supabase.from("dispute_messages").insert({
    dispute_id: disputeId,
    sender_id: authId,
    message_type: messageType,
    body,
    is_official: messageType === "admin" || messageType === "mediator",
  });
}

export async function proposeSettlementAction(disputeId: string, contractId: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) redirect(`/admin/disputes/${disputeId}?error=${encodeURIComponent("A reason is required.")}`);

  const supabase = await createClient();
  await supabase.from("settlement_proposals").insert({
    dispute_id: disputeId,
    proposed_by: authId,
    buyer_amount_usd: Number(formData.get("buyer_amount_usd") ?? 0),
    seller_amount_usd: Number(formData.get("seller_amount_usd") ?? 0),
    notes: reason,
  });

  await supabase.from("disputes").update({ status: "settlement_proposed" }).eq("id", disputeId);

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "propose_settlement",
    entityType: "dispute",
    entityId: disputeId,
    reason,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "settlement_proposed",
    description: `Admin proposed a settlement. ${reason}`,
  });

  redirect(`/admin/disputes/${disputeId}`);
}

export async function respondSettlementAction(
  proposalId: string,
  disputeId: string,
  role: "buyer_response" | "seller_response",
  formData: FormData
) {
  await requireUser();
  const supabase = await createClient();
  const response = String(formData.get("response") ?? "");
  await supabase.from("settlement_proposals").update({ [role]: response }).eq("id", proposalId);
  redirect(`/admin/disputes/${disputeId}`);
}

export async function closeDisputeAction(disputeId: string, contractId: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) redirect(`/admin/disputes/${disputeId}?error=${encodeURIComponent("A reason is required.")}`);

  const supabase = await createClient();
  const resolution = String(formData.get("resolution") ?? "");

  await supabase
    .from("disputes")
    .update({ status: "closed", resolution, closed_at: new Date().toISOString() })
    .eq("id", disputeId);

  await supabase.from("escrow_contracts").update({ status: "resolved" }).eq("id", contractId);

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "close_dispute",
    entityType: "dispute",
    entityId: disputeId,
    reason,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "dispute_closed",
    description: `Dispute closed. Resolution: ${resolution}. Reason: ${reason}`,
  });

  redirect(`/admin/disputes/${disputeId}`);
}
