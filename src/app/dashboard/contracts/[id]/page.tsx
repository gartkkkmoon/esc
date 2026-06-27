import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ContractChat } from "@/components/contract/contract-chat";
import { ContractTimeline, ContractProgressBar } from "@/components/contract/contract-timeline";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  generateInviteAction,
  requestReleaseAction,
  openDisputeAction,
  submitPaymentHashAction,
  sendMessageAction,
} from "@/lib/data/contracts";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { authId, profile } = await requireUser();
  const supabase = await createClient();

  const { data: contract } = await supabase.from("escrow_contracts").select("*").eq("id", id).single();
  if (!contract) notFound();

  const isBuyer = contract.buyer_id === authId;
  const isSeller = contract.seller_id === authId;
  if (!isBuyer && !isSeller) notFound();

  const [{ data: invites }, { data: messages }, { data: timeline }, { data: buyerProfile }, { data: sellerProfile }] =
    await Promise.all([
      supabase.from("contract_invites").select("*").eq("contract_id", id).order("created_at", { ascending: false }),
      supabase.from("contract_messages").select("*").eq("contract_id", id).order("created_at", { ascending: true }),
      supabase.from("contract_timeline_events").select("*").eq("contract_id", id).order("created_at", { ascending: true }),
      contract.buyer_id ? supabase.from("profiles").select("id, full_name").eq("id", contract.buyer_id).single() : Promise.resolve({ data: null }),
      contract.seller_id ? supabase.from("profiles").select("id, full_name").eq("id", contract.seller_id).single() : Promise.resolve({ data: null }),
    ]);

  const names: Record<string, string> = {};
  if (buyerProfile) names[buyerProfile.id] = buyerProfile.full_name;
  if (sellerProfile) names[sellerProfile.id] = sellerProfile.full_name;
  names[authId] = profile?.full_name ?? names[authId] ?? "You";

  const kycBlocked = contract.kyc_requirement === "required" && profile?.kyc_status !== "approved";
  const inviteLink = invites?.[0]
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${invites[0].token}`
    : null;

  // Deposit address shown to depositors: the admin-set per-contract address,
  // falling back to the platform wallet configured for this asset.
  let platformWallet: { address: string; network: string | null } | null = null;
  if (contract.crypto_asset) {
    const { data } = await supabase
      .from("wallet_addresses")
      .select("address, network")
      .eq("crypto_asset", contract.crypto_asset)
      .eq("is_platform_wallet", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    platformWallet = data;
  }
  const depositAddress = contract.deposit_address ?? platformWallet?.address ?? null;
  const depositNetwork = contract.payment_network ?? platformWallet?.network ?? null;
  const canDeposit =
    (isBuyer || isSeller) &&
    contract.seller_id &&
    ["unpaid", "pending"].includes(contract.payment_status) &&
    !kycBlocked;

  return (
    <>
      <PageHeader
        title={contract.title}
        description={`${contract.contract_number} · Created ${formatDate(contract.created_at)}`}
        actions={<StatusBadge status={contract.status} />}
      />

      <div className="px-6 pt-6">
        <Card className="bg-navy-900 p-6 text-white">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-white/50">
            Digital Closing Room Progress
          </p>
          <ContractProgressBar status={contract.status} />
        </Card>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Contract Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Buyer" value={buyerProfile?.full_name ?? "—"} />
              <Info label="Seller" value={sellerProfile?.full_name ?? "Awaiting invite acceptance"} />
              <Info label="Amount" value={`${formatUsd(contract.amount_usd)} · ${contract.amount_crypto ?? "—"} ${contract.crypto_asset ?? ""}`} />
              <Info label="Payment status" value={<StatusBadge status={contract.payment_status} />} />
              <Info label="KYC status" value={<StatusBadge status={profile?.kyc_status ?? "not_required"} />} />
              <Info label="Network" value={contract.payment_network ?? "—"} />
              <Info label="Tx hash" value={contract.transaction_hash ?? "Not submitted"} />
              <Info label="Confirmations" value={String(contract.confirmations)} />
            </CardContent>
            {contract.description && (
              <CardContent className="border-t border-border-soft text-sm text-gray-600">
                {contract.description}
              </CardContent>
            )}
          </Card>

          {kycBlocked && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent>
                <p className="text-sm font-medium text-amber-800">
                  This transaction is above $100 and requires identity verification.
                </p>
                <Link href="/dashboard/kyc" className="mt-2 inline-block text-sm font-medium text-navy underline">
                  Complete KYC verification
                </Link>
              </CardContent>
            </Card>
          )}

          {isBuyer && !contract.seller_id && (
            <Card>
              <CardHeader><CardTitle>Invite Seller</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {inviteLink ? (
                  <div>
                    <Label>Secure invite link</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={inviteLink} />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Expires {formatDate(invites?.[0]?.expires_at)} · Status: {invites?.[0]?.status}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No invite sent yet.</p>
                )}
                <form action={generateInviteAction.bind(null, contract.id)} className="flex gap-2">
                  <Input name="seller_email" type="email" placeholder="seller@example.com" required />
                  <Button type="submit" variant="outline">Send New Link</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {canDeposit && (
            <Card>
              <CardHeader><CardTitle>Send Your Deposit</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="rounded-lg bg-gold-tint px-3 py-2 text-xs text-navy">
                  Send your {contract.crypto_asset} to the address below. Once received, the escrow
                  officer verifies it on-chain and manually marks the deposit confirmed.
                </p>
                <Info
                  label="Deposit address"
                  value={
                    depositAddress
                      ? <span className="break-all font-mono text-xs">{depositAddress}</span>
                      : "Will be assigned by the escrow officer shortly"
                  }
                />
                <Info label="Asset" value={`${contract.crypto_asset} on ${depositNetwork ?? "TBD"}`} />
                <Info label="Amount" value={`${contract.amount_crypto ?? "—"} ${contract.crypto_asset}`} />
                <form action={submitPaymentHashAction.bind(null, contract.id)} className="space-y-2">
                  <Label htmlFor="transaction_hash">Your transaction hash</Label>
                  <Input id="transaction_hash" name="transaction_hash" placeholder="0x..." required />
                  <Button type="submit" size="sm">Submit Transaction Hash</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
            <ContractChat
              messages={messages ?? []}
              onSend={sendMessageAction.bind(null, contract.id, isBuyer ? "buyer" : "seller")}
              names={names}
            />
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent><ContractTimeline events={timeline ?? []} /></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Escrow Officer &amp; Participants</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-lg bg-gold-tint px-3 py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">AT</span>
                <div>
                  <div className="font-medium text-gray-900">Admin Team</div>
                  <div className="text-xs text-gray-500">Escrow Officer</div>
                </div>
              </div>
              <Info label="Buyer" value={buyerProfile?.full_name ?? "—"} />
              <Info label="Seller" value={sellerProfile?.full_name ?? "Awaiting invite acceptance"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["delivery_completed", "active_escrow", "awaiting_delivery"].includes(contract.status) && (
                <form action={requestReleaseAction.bind(null, contract.id)}>
                  <Button type="submit" variant="success" className="w-full">Request Fund Release</Button>
                </form>
              )}
              {!["disputed", "under_mediation", "closed", "resolved"].includes(contract.status) && (
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-red-600">Open a Dispute</summary>
                  <form action={openDisputeAction.bind(null, contract.id)} className="mt-2 space-y-2">
                    <Textarea name="reason" rows={3} placeholder="Describe the issue" required />
                    <Button type="submit" variant="danger" size="sm" className="w-full">Open Dispute</Button>
                  </form>
                </details>
              )}
              <p className="text-xs text-gray-400">
                All releases and status changes are manually reviewed by an escrow officer.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Terms</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Info label="Delivery terms" value={contract.delivery_terms || "—"} />
              <Info label="Inspection period" value={contract.inspection_period || "—"} />
              <Info label="Release conditions" value={contract.release_conditions || "—"} />
              <Info label="Dispute terms" value={contract.dispute_terms || "—"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-0.5 font-medium text-gray-800">{value}</div>
    </div>
  );
}
