"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/session";
import { addTimelineEvent } from "@/lib/data/audit";

const KYC_THRESHOLD_USD = 100;

export async function createContractAction(formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();

  const amountUsd = Number(formData.get("amount_usd") ?? 0);
  const kycRequirement = amountUsd > KYC_THRESHOLD_USD ? "required" : "not_required";

  const { data: contract, error } = await supabase
    .from("escrow_contracts")
    .insert({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      buyer_id: authId,
      crypto_asset: String(formData.get("crypto_asset") ?? "BTC"),
      amount_crypto: Number(formData.get("amount_crypto") ?? 0) || null,
      amount_usd: amountUsd,
      payment_network: String(formData.get("payment_network") ?? ""),
      delivery_terms: String(formData.get("delivery_terms") ?? ""),
      inspection_period: String(formData.get("inspection_period") ?? ""),
      release_conditions: String(formData.get("release_conditions") ?? ""),
      dispute_terms: String(formData.get("dispute_terms") ?? ""),
      kyc_requirement: kycRequirement,
      status: "waiting_for_seller",
      created_by: authId,
    })
    .select()
    .single();

  if (error || !contract) {
    redirect(`/dashboard/contracts/new?error=${encodeURIComponent(error?.message ?? "Could not create contract")}`);
  }

  await supabase.from("contract_participants").insert({
    contract_id: contract.id,
    user_id: authId,
    role: "buyer",
  });

  await addTimelineEvent({
    contractId: contract.id,
    actorId: authId,
    eventType: "contract_created",
    description: "Buyer created the escrow contract.",
  });

  const sellerEmail = String(formData.get("seller_email") ?? "");
  if (sellerEmail) {
    await supabase.from("contract_invites").insert({
      contract_id: contract.id,
      token: randomUUID().replace(/-/g, ""),
      seller_email: sellerEmail,
      invited_by: authId,
    });
  }

  redirect(`/dashboard/contracts/${contract.id}`);
}

export async function generateInviteAction(contractId: string, formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();
  const sellerEmail = String(formData.get("seller_email") ?? "");

  await supabase.from("contract_invites").insert({
    contract_id: contractId,
    token: randomUUID().replace(/-/g, ""),
    seller_email: sellerEmail,
    invited_by: authId,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "invite_sent",
    description: `Buyer sent an invite link to ${sellerEmail}.`,
  });

  redirect(`/dashboard/contracts/${contractId}`);
}

export async function sendMessageAction(
  contractId: string,
  messageType: "buyer" | "seller" | "admin" | "mediator" | "compliance",
  formData: FormData
) {
  const { authId } = await requireUser();
  const supabase = await createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await supabase.from("contract_messages").insert({
    contract_id: contractId,
    sender_id: authId,
    message_type: messageType,
    body,
    is_official: messageType === "admin" || messageType === "mediator" || messageType === "compliance",
  });
}

export async function requestReleaseAction(contractId: string) {
  const { authId } = await requireUser();
  const supabase = await createClient();

  await supabase
    .from("escrow_contracts")
    .update({ status: "release_requested" })
    .eq("id", contractId);

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "release_requested",
    description: "Buyer requested fund release. Awaiting admin review.",
  });

  redirect(`/dashboard/contracts/${contractId}`);
}

export async function openDisputeAction(contractId: string, formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();
  const reason = String(formData.get("reason") ?? "");

  await supabase.from("disputes").insert({
    contract_id: contractId,
    opened_by: authId,
    reason,
    status: "open",
  });

  await supabase.from("escrow_contracts").update({ status: "disputed" }).eq("id", contractId);

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "dispute_opened",
    description: "A dispute was opened on this contract.",
  });

  redirect(`/dashboard/contracts/${contractId}`);
}

export async function acceptInviteAction(token: string) {
  const { authId } = await requireUser();
  const supabase = await createClient();

  const { data: invite } = await supabase
    .from("contract_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (!invite || invite.used_at || new Date(invite.expires_at) < new Date()) {
    redirect(`/invite/${token}?error=Invite is no longer valid`);
  }

  await supabase
    .from("escrow_contracts")
    .update({ seller_id: authId, status: "seller_joined" })
    .eq("id", invite!.contract_id);

  await supabase.from("contract_participants").insert({
    contract_id: invite!.contract_id,
    user_id: authId,
    role: "seller",
  });

  await supabase
    .from("contract_invites")
    .update({ used_at: new Date().toISOString(), used_by: authId, status: "accepted" })
    .eq("id", invite!.id);

  await addTimelineEvent({
    contractId: invite!.contract_id,
    actorId: authId,
    eventType: "seller_joined",
    description: "Seller accepted the invite and joined the contract.",
  });

  redirect(`/dashboard/contracts/${invite!.contract_id}`);
}

export async function declineInviteAction(token: string) {
  const supabase = await createClient();
  await supabase
    .from("contract_invites")
    .update({ status: "declined" })
    .eq("token", token);
  redirect(`/invite/${token}?declined=1`);
}

export async function submitPaymentHashAction(contractId: string, formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();
  const txHash = String(formData.get("transaction_hash") ?? "");

  await supabase
    .from("escrow_contracts")
    .update({ transaction_hash: txHash, status: "deposit_pending", payment_status: "pending" })
    .eq("id", contractId);

  await supabase.from("contract_payments").insert({
    contract_id: contractId,
    payment_status: "pending",
    transaction_hash: txHash,
    submitted_by: authId,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "payment_submitted",
    description: `Buyer submitted transaction hash ${txHash}.`,
  });

  redirect(`/dashboard/contracts/${contractId}`);
}

/**
 * A depositor (buyer or seller) marks that they've sent their deposit — no
 * transaction hash required. This flags the contract for the escrow officer to
 * verify off-platform and manually confirm. Writes go through the service-role
 * client (after verifying the caller is a participant) so they aren't blocked
 * by RLS on the live database.
 */
export async function markDepositSentAction(contractId: string, role: "buyer" | "seller") {
  const { authId } = await requireUser();
  const admin = createAdminClient();

  const { data: contract } = await admin
    .from("escrow_contracts")
    .select("buyer_id, seller_id")
    .eq("id", contractId)
    .single();

  if (!contract || (contract.buyer_id !== authId && contract.seller_id !== authId)) {
    redirect("/dashboard");
  }

  await admin
    .from("escrow_contracts")
    .update({ status: "deposit_pending", payment_status: "pending" })
    .eq("id", contractId);

  await admin.from("contract_payments").insert({
    contract_id: contractId,
    payment_status: "pending",
    submitted_by: authId,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "deposit_marked_sent",
    description: `${role === "buyer" ? "Buyer" : "Seller"} marked their deposit as sent. Awaiting manual confirmation by the escrow officer.`,
  });

  redirect(`/dashboard/contracts/${contractId}`);
}
