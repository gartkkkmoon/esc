import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContractChat } from "@/components/contract/contract-chat";
import { ContractTimeline } from "@/components/contract/contract-timeline";
import { ManualActionsPanel } from "@/components/admin/manual-actions-panel";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { addInternalNoteAction, editContractAction } from "@/lib/data/admin-actions";

export default async function AdminContractDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { authId } = await requireAdmin();
  const supabase = await createClient();

  const { data: contract } = await supabase.from("escrow_contracts").select("*").eq("id", id).single();
  if (!contract) notFound();

  const [
    { data: buyer }, { data: seller },
    { data: messages }, { data: timeline },
    { data: notes }, { data: dispute }, { data: auditLogs },
  ] = await Promise.all([
    contract.buyer_id ? supabase.from("profiles").select("*").eq("id", contract.buyer_id).single() : Promise.resolve({ data: null }),
    contract.seller_id ? supabase.from("profiles").select("*").eq("id", contract.seller_id).single() : Promise.resolve({ data: null }),
    supabase.from("contract_messages").select("*").eq("contract_id", id).order("created_at", { ascending: true }),
    supabase.from("contract_timeline_events").select("*").eq("contract_id", id).order("created_at", { ascending: true }),
    supabase.from("admin_notes").select("*").eq("contract_id", id).order("created_at", { ascending: false }),
    supabase.from("disputes").select("*").eq("contract_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("audit_logs").select("*").eq("entity_id", id).order("created_at", { ascending: false }),
  ]);

  const names: Record<string, string> = { [authId]: "You (Admin)" };
  if (buyer) names[buyer.id] = buyer.full_name;
  if (seller) names[seller.id] = seller.full_name;

  return (
    <>
      <PageHeader
        title={`${contract.contract_number} · ${contract.title}`}
        description={`Created ${formatDate(contract.created_at)} · Updated ${formatDate(contract.updated_at)}`}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={contract.status} />
            <StatusBadge status={contract.payment_status} />
            {contract.is_locked && <StatusBadge status="suspended" />}
          </div>
        }
      />
      {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Contract Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Buyer" value={buyer?.full_name ?? "—"} />
              <Info label="Seller" value={seller?.full_name ?? "—"} />
              <Info label="Escrow Officer" value="Admin Team" />
              <Info label="KYC Status (buyer)" value={<StatusBadge status={buyer?.kyc_status ?? "not_required"} />} />
              <Info label="Crypto Asset" value={contract.crypto_asset ?? "—"} />
              <Info label="Amount" value={`${contract.amount_crypto ?? "—"} ${contract.crypto_asset ?? ""}`} />
              <Info label="USD Value" value={formatUsd(contract.amount_usd)} />
              <Info label="Confirmations" value={String(contract.confirmations)} />
              <Info label="Deposit Address" value={contract.deposit_address ?? "—"} />
              <Info label="Transaction Hash" value={contract.transaction_hash ?? "—"} />
            </CardContent>
            {contract.description && (
              <CardContent className="border-t border-border-soft text-sm text-gray-600">{contract.description}</CardContent>
            )}
          </Card>

          {dispute && (
            <Card className="border-red-200 bg-red-50/40">
              <CardHeader><CardTitle>Dispute</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <Info label="Status" value={<StatusBadge status={dispute.status} />} />
                <p className="mt-2 text-gray-700">{dispute.reason}</p>
                <a href={`/admin/disputes/${dispute.id}`} className="mt-2 inline-block text-sm font-medium text-navy underline">
                  Open Mediation Center
                </a>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Buyer / Seller Chat — Admin Can Join</CardTitle></CardHeader>
            <ContractChat contractId={contract.id} messages={messages ?? []} senderType="admin" names={names} />
          </Card>

          <Card>
            <CardHeader><CardTitle>Edit Contract</CardTitle></CardHeader>
            <CardContent>
              <form action={editContractAction.bind(null, contract.id)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={contract.title} />
                  </div>
                  <div>
                    <Label htmlFor="crypto_asset">Crypto asset</Label>
                    <Select id="crypto_asset" name="crypto_asset" defaultValue={contract.crypto_asset ?? "BTC"}>
                      {["BTC","ETH","USDT","USDC","SOL","XRP","LTC"].map((a) => <option key={a} value={a}>{a}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount_usd">USD value</Label>
                    <Input id="amount_usd" name="amount_usd" type="number" step="0.01" defaultValue={contract.amount_usd} />
                  </div>
                  <div>
                    <Label htmlFor="amount_crypto">Amount (crypto)</Label>
                    <Input id="amount_crypto" name="amount_crypto" type="number" step="0.00000001" defaultValue={contract.amount_crypto ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="deposit_address">Deposit address</Label>
                    <Input id="deposit_address" name="deposit_address" defaultValue={contract.deposit_address ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="transaction_hash">Transaction hash</Label>
                    <Input id="transaction_hash" name="transaction_hash" defaultValue={contract.transaction_hash ?? ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={2} defaultValue={contract.description ?? ""} />
                </div>
                <div>
                  <Label htmlFor="release_conditions">Release conditions</Label>
                  <Textarea id="release_conditions" name="release_conditions" rows={2} defaultValue={contract.release_conditions ?? ""} />
                </div>
                <div>
                  <Label htmlFor="reason">Reason for edit (required)</Label>
                  <Textarea id="reason" name="reason" rows={2} required placeholder="Why is this contract being edited?" />
                </div>
                <Button type="submit" variant="outline">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent><ContractTimeline events={timeline ?? []} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Audit Log (this contract)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(auditLogs ?? []).map((log) => (
                <div key={log.id} className="rounded-lg border border-border-soft px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{log.action.replaceAll("_", " ")}</span>
                    <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="mt-1 text-gray-600">{log.reason}</p>
                </div>
              ))}
              {(auditLogs ?? []).length === 0 && <p className="text-gray-400">No actions recorded yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ManualActionsPanel contractId={contract.id} />

          <Card>
            <CardHeader><CardTitle>Internal Notes (staff only)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <form action={addInternalNoteAction.bind(null, contract.id)} className="space-y-2">
                <Textarea name="body" rows={3} placeholder="Add an internal note…" required />
                <Button type="submit" size="sm" className="w-full">Add Note</Button>
              </form>
              <div className="space-y-2">
                {(notes ?? []).map((n) => (
                  <div key={n.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <p className="text-gray-700">{n.body}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(n.created_at)}</p>
                  </div>
                ))}
                {(notes ?? []).length === 0 && <p className="text-sm text-gray-400">No internal notes.</p>}
              </div>
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
