"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CryptoAsset } from "@/lib/supabase/types";

// Wallet writes use the service-role client (already gated by requireAdmin) so
// they never depend on user_roles RLS being correctly configured on the live DB.

export async function addWalletAction(formData: FormData) {
  await requireAdmin();
  const crypto_asset = String(formData.get("crypto_asset") ?? "") as CryptoAsset;
  const address = String(formData.get("address") ?? "").trim();
  const network = String(formData.get("network") ?? "").trim() || null;
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!crypto_asset || !address) {
    redirect(`/admin/wallets?error=${encodeURIComponent("Asset and address are required.")}`);
  }

  const admin = createAdminClient();
  await admin.from("wallet_addresses").insert({
    crypto_asset,
    address,
    network,
    label,
    is_platform_wallet: true,
    contract_id: null,
  });

  redirect("/admin/wallets?ok=added");
}

export async function updateWalletAction(walletId: string, formData: FormData) {
  await requireAdmin();
  const address = String(formData.get("address") ?? "").trim();
  const network = String(formData.get("network") ?? "").trim() || null;
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!address) {
    redirect(`/admin/wallets?error=${encodeURIComponent("Address cannot be empty.")}`);
  }

  const admin = createAdminClient();
  await admin.from("wallet_addresses").update({ address, network, label }).eq("id", walletId);

  redirect("/admin/wallets?ok=updated");
}

export async function deleteWalletAction(walletId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("wallet_addresses").delete().eq("id", walletId);
  redirect("/admin/wallets?ok=deleted");
}
