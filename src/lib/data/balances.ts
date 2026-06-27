"use server";

import { redirect } from "next/navigation";
import { requireUser, requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { addTimelineEvent } from "@/lib/data/audit";
import type { SupabaseClient } from "@supabase/supabase-js";

// All balance writes go through the service-role client (gated by requireUser /
// requireAdmin in the app layer) so they never depend on RLS being correct.

/** Apply a signed delta to a user's balance for an asset (upsert). */
async function applyBalanceDelta(
  db: SupabaseClient,
  userId: string,
  asset: string,
  delta: number
) {
  const { data: row } = await db
    .from("user_balances")
    .select("amount")
    .eq("user_id", userId)
    .eq("asset", asset)
    .maybeSingle();
  const next = Number(row?.amount ?? 0) + delta;
  await db
    .from("user_balances")
    .upsert(
      { user_id: userId, asset, amount: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id,asset" }
    );
}

/** Current balance for one asset. */
async function balanceOf(db: SupabaseClient, userId: string, asset: string): Promise<number> {
  const { data } = await db
    .from("user_balances")
    .select("amount")
    .eq("user_id", userId)
    .eq("asset", asset)
    .maybeSingle();
  return Number(data?.amount ?? 0);
}

/**
 * Admin: settle a crypto-pair exchange contract by moving platform balances.
 * Buyer pays `pay_amount pay_asset` and receives `receive_amount receive_asset`;
 * the seller is the mirror. Blocked unless both sides have enough balance, so
 * you can only settle after both deposits are approved.
 */
export async function settleExchangeAction(contractId: string) {
  const { authId } = await requireAdmin();
  const db = createAdminClient();

  const { data: c } = await db.from("escrow_contracts").select("*").eq("id", contractId).single();
  if (!c) redirect(`/admin/contracts/${contractId}?error=Not+found`);
  if (c.deal_kind !== "exchange") {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent("This is not an exchange contract.")}`);
  }

  const buyer = c.buyer_id as string | null;
  const seller = c.seller_id as string | null;
  const payAsset = c.pay_asset as string | null;
  const recvAsset = c.receive_asset as string | null;
  const payAmt = Number(c.pay_amount ?? 0);
  const recvAmt = Number(c.receive_amount ?? 0);

  if (!buyer || !seller || !payAsset || !recvAsset || !(payAmt > 0) || !(recvAmt > 0)) {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent("Set buyer, seller, and both pay/receive assets + amounts first.")}`);
  }

  // Require both sides funded.
  if ((await balanceOf(db, buyer!, payAsset!)) < payAmt) {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent(`Buyer balance too low: needs ${payAmt} ${payAsset}.`)}`);
  }
  if ((await balanceOf(db, seller!, recvAsset!)) < recvAmt) {
    redirect(`/admin/contracts/${contractId}?error=${encodeURIComponent(`Seller balance too low: needs ${recvAmt} ${recvAsset}.`)}`);
  }

  // Buyer: -pay +receive. Seller: -receive +pay.
  await applyBalanceDelta(db, buyer!, payAsset!, -payAmt);
  await applyBalanceDelta(db, buyer!, recvAsset!, recvAmt);
  await applyBalanceDelta(db, seller!, recvAsset!, -recvAmt);
  await applyBalanceDelta(db, seller!, payAsset!, payAmt);

  const now = new Date().toISOString();
  await db.from("balance_transactions").insert([
    { user_id: buyer, asset: payAsset, amount: -payAmt, tx_type: "exchange_debit", status: "approved", contract_id: contractId, reviewed_by: authId, reviewed_at: now, note: "Exchange settlement" },
    { user_id: buyer, asset: recvAsset, amount: recvAmt, tx_type: "exchange_credit", status: "approved", contract_id: contractId, reviewed_by: authId, reviewed_at: now, note: "Exchange settlement" },
    { user_id: seller, asset: recvAsset, amount: -recvAmt, tx_type: "exchange_debit", status: "approved", contract_id: contractId, reviewed_by: authId, reviewed_at: now, note: "Exchange settlement" },
    { user_id: seller, asset: payAsset, amount: payAmt, tx_type: "exchange_credit", status: "approved", contract_id: contractId, reviewed_by: authId, reviewed_at: now, note: "Exchange settlement" },
  ]);

  await db.from("escrow_contracts").update({ status: "released", payment_status: "released" }).eq("id", contractId);

  await addTimelineEvent({
    contractId,
    actorId: authId,
    eventType: "exchange_settled",
    description: `Exchange settled: buyer paid ${payAmt} ${payAsset} and received ${recvAmt} ${recvAsset}.`,
  });

  redirect(`/admin/contracts/${contractId}?ok=settled`);
}

/** Read a user's balances (service-role, RLS-independent). */
export async function getBalances(userId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("user_balances")
    .select("*")
    .eq("user_id", userId)
    .order("asset");
  return data ?? [];
}

/** Read a user's ledger entries. */
export async function getBalanceHistory(userId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("balance_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

/** User: request a deposit. Creates a pending ledger entry — credited only on admin approval. */
export async function requestDepositAction(formData: FormData) {
  const { authId } = await requireUser();
  const asset = String(formData.get("asset") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!asset || !(amount > 0)) {
    redirect(`/dashboard/wallet?error=${encodeURIComponent("Choose an asset and a positive amount.")}`);
  }

  const db = createAdminClient();
  await db.from("balance_transactions").insert({
    user_id: authId,
    asset,
    amount,
    tx_type: "deposit",
    status: "pending",
    note,
  });

  redirect("/dashboard/wallet?ok=requested");
}

/** Admin: approve a pending deposit — credits the user's balance. */
export async function approveDepositAction(txId: string) {
  const { authId } = await requireAdmin();
  const db = createAdminClient();

  const { data: tx } = await db.from("balance_transactions").select("*").eq("id", txId).single();
  if (!tx || tx.status !== "pending") {
    redirect("/admin/balances?error=Already+processed");
  }

  await db
    .from("balance_transactions")
    .update({ status: "approved", reviewed_by: authId, reviewed_at: new Date().toISOString() })
    .eq("id", txId);

  await applyBalanceDelta(db, tx.user_id, tx.asset, Number(tx.amount));
  redirect("/admin/balances?ok=approved");
}

/** Admin: reject a pending deposit (no balance change). */
export async function rejectDepositAction(txId: string) {
  const { authId } = await requireAdmin();
  const db = createAdminClient();
  await db
    .from("balance_transactions")
    .update({ status: "rejected", reviewed_by: authId, reviewed_at: new Date().toISOString() })
    .eq("id", txId);
  redirect("/admin/balances?ok=rejected");
}

/** Admin: directly credit or debit any user's balance (amount may be negative). */
export async function adjustBalanceAction(formData: FormData) {
  const { authId } = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const asset = String(formData.get("asset") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!userId || !asset || !amount) {
    redirect(`/admin/balances?error=${encodeURIComponent("User, asset and a non-zero amount are required.")}`);
  }

  const db = createAdminClient();
  await db.from("balance_transactions").insert({
    user_id: userId,
    asset,
    amount,
    tx_type: "adjustment",
    status: "approved",
    note,
    reviewed_by: authId,
    reviewed_at: new Date().toISOString(),
  });
  await applyBalanceDelta(db, userId, asset, amount);
  redirect("/admin/balances?ok=adjusted");
}
