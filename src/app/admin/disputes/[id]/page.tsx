import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContractChat } from "@/components/contract/contract-chat";
import { formatDate, formatUsd } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { proposeSettlementAction, closeDisputeAction, sendDisputeMessageAction } from "@/lib/data/disputes";

export default async function AdminDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { authId } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: dispute } = await supabase.from("disputes").select("*").eq("id", id).single();
  if (!dispute) notFound();

  const [{ data: contract }, { data: messages }, { data: proposals }] = await Promise.all([
    supabase.from("escrow_contracts").select("*").eq("id", dispute.contract_id).single(),
    supabase
      .from("dispute_messages")
      .select("*")
      .eq("dispute_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("settlement_proposals").select("*").eq("dispute_id", id).order("created_at", { ascending: false }),
  ]);

  const names: Record<string, string> = { [authId]: "You (Admin/Mediator)" };

  return (
    <>
      <PageHeader
        title={`Dispute · ${contract?.contract_number ?? ""}`}
        description={contract?.title}
        actions={<StatusBadge status={dispute.status} />}
      />
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Dispute Reason</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-700">{dispute.reason}</CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mediation Chat</CardTitle></CardHeader>
            <ContractChat messages={messages ?? []} onSend={sendDisputeMessageAction.bind(null, dispute.id, "mediator")} names={names} />
          </Card>

          <Card>
            <CardHeader><CardTitle>Settlement Proposals</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(proposals ?? []).map((p) => (
                <div key={p.id} className="rounded-lg border border-border-soft p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Buyer receives <strong>{formatUsd(p.buyer_amount_usd)}</strong> · Seller receives <strong>{formatUsd(p.seller_amount_usd)}</strong></span>
                    <span className="text-xs text-gray-400">{formatDate(p.created_at)}</span>
                  </div>
                  <p className="mt-1 text-gray-500">{p.notes}</p>
                  <div className="mt-1 flex gap-4 text-xs">
                    <span>Buyer: {p.buyer_response ?? "no response"}</span>
                    <span>Seller: {p.seller_response ?? "no response"}</span>
                  </div>
                </div>
              ))}
              {(proposals ?? []).length === 0 && <p className="text-sm text-gray-400">No settlement proposed yet.</p>}

              <form action={proposeSettlementAction.bind(null, dispute.id, dispute.contract_id)} className="space-y-2 border-t border-border-soft pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label htmlFor="buyer_amount_usd">Buyer receives (USD)</Label><Input id="buyer_amount_usd" name="buyer_amount_usd" type="number" step="0.01" /></div>
                  <div><Label htmlFor="seller_amount_usd">Seller receives (USD)</Label><Input id="seller_amount_usd" name="seller_amount_usd" type="number" step="0.01" /></div>
                </div>
                <Label htmlFor="reason">Reason / proposal notes</Label>
                <Textarea id="reason" name="reason" rows={2} required />
                <Button type="submit" size="sm">Propose Settlement</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Resolve Dispute</CardTitle></CardHeader>
            <CardContent>
              <form action={closeDisputeAction.bind(null, dispute.id, dispute.contract_id)} className="space-y-2">
                <Label htmlFor="resolution">Resolution summary</Label>
                <Textarea id="resolution" name="resolution" rows={3} placeholder="What was decided?" />
                <Label htmlFor="reason">Reason (required)</Label>
                <Textarea id="reason" name="reason" rows={2} required />
                <Button type="submit" variant="success" className="w-full">Close Dispute</Button>
              </form>
              <p className="mt-3 text-xs text-gray-400">
                Use the contract&apos;s Manual Actions panel to release or refund funds once a resolution is reached.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
