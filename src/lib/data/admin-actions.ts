"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction, addTimelineEvent } from "@/lib/data/audit";
import type { AdminActionType, ContractStatus, PaymentStatus } from "@/lib/supabase/types";

const CONTRACT_STATUS_ACTIONS: Partial<Record<AdminActionType, ContractStatus>> = {
  mark_deposit_confirmed: "deposit_confirmed",
  mark_pending: "admin_reviewing",
  mark_complete: "completed",
  mark_incomplete: "awaiting_delivery",
  release_funds: "released",
  refund_funds: "refunded",
  pause_contract: "admin_reviewing",
  cancel_contract: "cancelled",
};

const PAYMENT_STATUS_ACTIONS: Partial<Record<AdminActionType, PaymentStatus>> = {
  mark_paid: "paid",
  mark_unpaid: "unpaid",
  mark_payment_failed: "failed",
  release_funds: "released",
  refund_funds: "refunded",
};

const ACTION_LABELS: Record<AdminActionType, string> = {
  mark_deposit_confirmed: "marked the deposit as confirmed",
  mark_pending: "marked the contract as pending review",
  mark_payment_failed: "marked the payment as failed",
  mark_paid: "marked the contract as paid",
  mark_unpaid: "marked the contract as unpaid",
  mark_complete: "marked the contract as complete",
  mark_incomplete: "marked the contract as incomplete",
  release_funds: "manually released funds to the seller",
  refund_funds: "manually refunded funds to the buyer",
  pause_contract: "paused the contract",
  cancel_contract: "cancelled the contract",
  lock_contract: "locked the contract",
  unlock_contract: "unlocked the contract",
  open_dispute: "opened a dispute",
  assign_mediator: "assigned a mediator",
  request_documents: "requested additional documents",
  add_internal_note: "added an internal note",
  verify_user: "verified the user",
  unverify_user: "unverified the user",
  enable_user: "enabled the user account",
  disable_user: "disabled the user account",
  suspend_user: "suspended the user account",
  reactivate_user: "reactivated the user account",
  approve_kyc: "approved KYC",
  reject_kyc: "rejected KYC",
  request_more_kyc_info: "requested more KYC information",
  create_contract: "created a contract manually",
  edit_contract: "edited the contract",
  reset_password: "triggered a password reset",
  join_chat: "joined the contract chat",
  send_official_message: "sent an official message",
  propose_settlement: "proposed a settlement",
  close_dispute: "closed the dispute",
};

export async function performContractActionAction(
  contractId: string,
  action: AdminActionType,
  formData: FormData
) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent("A reason is required for this action.")}`);
  }
  const internalNote = String(formData.get("internal_note") ?? "").trim();

  const supabase = await createClient();
  const { data: before } = await supabase.from("escrow_contracts").select("*").eq("id", contractId).single();

  const update: Record<string, unknown> = {};
  if (CONTRACT_STATUS_ACTIONS[action]) update.status = CONTRACT_STATUS_ACTIONS[action];
  if (PAYMENT_STATUS_ACTIONS[action]) update.payment_status = PAYMENT_STATUS_ACTIONS[action];
  if (action === "lock_contract") update.is_locked = true;
  if (action === "unlock_contract") update.is_locked = false;
  if (action === "mark_deposit_confirmed") update.confirmations = (before?.confirmations ?? 0) + 1;

  if (Object.keys(update).length > 0) {
    await supabase.from("escrow_contracts").update(update).eq("id", contractId);
  }

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action,
    entityType: "escrow_contract",
    entityId: contractId,
    oldValue: before ?? null,
    newValue: update,
    reason,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: action,
    description: `Admin ${ACTION_LABELS[action]}. Reason: ${reason}`,
  });

  if (internalNote) {
    await supabase.from("admin_notes").insert({
      contract_id: contractId,
      author_id: authId,
      body: internalNote,
    });
  }

  redirect(`/admin/contracts/${contractId}`);
}

export async function addInternalNoteAction(contractId: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const supabase = await createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await supabase.from("admin_notes").insert({ contract_id: contractId, author_id: authId, body });

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "add_internal_note",
    entityType: "escrow_contract",
    entityId: contractId,
    reason: "Internal staff note added",
  });

  redirect(`/admin/contracts/${contractId}`);
}

export async function adminSendMessageAction(contractId: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const supabase = await createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await supabase.from("contract_messages").insert({
    contract_id: contractId,
    sender_id: authId,
    message_type: "admin",
    body,
    is_official: true,
  });

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "send_official_message",
    entityType: "escrow_contract",
    entityId: contractId,
    reason: "Admin joined buyer/seller chat and sent an official message",
  });
}

export async function editContractAction(contractId: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent("A reason is required to edit a contract.")}`);
  }

  const supabase = await createClient();
  const { data: before } = await supabase.from("escrow_contracts").select("*").eq("id", contractId).single();

  const update = {
    title: String(formData.get("title") ?? before?.title),
    description: String(formData.get("description") ?? before?.description ?? ""),
    amount_usd: Number(formData.get("amount_usd") ?? before?.amount_usd ?? 0),
    amount_crypto: Number(formData.get("amount_crypto") ?? 0) || null,
    crypto_asset: String(formData.get("crypto_asset") ?? before?.crypto_asset),
    deposit_address: String(formData.get("deposit_address") ?? "") || null,
    transaction_hash: String(formData.get("transaction_hash") ?? "") || null,
    release_conditions: String(formData.get("release_conditions") ?? ""),
  };

  await supabase.from("escrow_contracts").update(update).eq("id", contractId);

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "edit_contract",
    entityType: "escrow_contract",
    entityId: contractId,
    oldValue: before ?? null,
    newValue: update,
    reason,
  });

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "edit_contract",
    description: `Admin edited contract details. Reason: ${reason}`,
  });

  redirect(`/admin/contracts/${contractId}`);
}

export async function createContractByAdminAction(formData: FormData) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    redirect(`/admin/contracts/new?error=${encodeURIComponent("A reason is required to create a manual contract.")}`);
  }

  const supabase = await createClient();
  const amountUsd = Number(formData.get("amount_usd") ?? 0);

  const { data: contract, error } = await supabase
    .from("escrow_contracts")
    .insert({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      buyer_id: String(formData.get("buyer_id") ?? "") || null,
      seller_id: String(formData.get("seller_id") ?? "") || null,
      crypto_asset: String(formData.get("crypto_asset") ?? "BTC"),
      amount_crypto: Number(formData.get("amount_crypto") ?? 0) || null,
      amount_usd: amountUsd,
      kyc_requirement: amountUsd > 100 ? "required" : "not_required",
      status: "admin_reviewing",
      created_by: authId,
    })
    .select()
    .single();

  if (error || !contract) {
    redirect(`/admin/contracts/new?error=${encodeURIComponent(error?.message ?? "Could not create contract")}`);
  }

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "create_contract",
    entityType: "escrow_contract",
    entityId: contract.id,
    newValue: contract,
    reason,
  });

  await addTimelineEvent({
    contractId: contract.id,
    actorId: authId,
    eventType: "created_by_admin",
    description: `Contract created by the escrow team. Reason: ${reason}`,
  });

  redirect(`/admin/contracts/${contract.id}`);
}

export async function assignMediatorAction(contractId: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent("A reason is required.")}`);
  }
  const mediatorId = String(formData.get("mediator_id") ?? "");

  const supabase = await createClient();
  await supabase.from("escrow_contracts").update({ mediator_id: mediatorId, status: "under_mediation" }).eq("id", contractId);
  await supabase.from("disputes").update({ mediator_id: mediatorId, status: "mediation" }).eq("contract_id", contractId);

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "assign_mediator",
    entityType: "escrow_contract",
    entityId: contractId,
    reason,
  });

  redirect(`/admin/contracts/${contractId}`);
}
