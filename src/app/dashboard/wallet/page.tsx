import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { getBalances, getBalanceHistory, requestDepositAction } from "@/lib/data/balances";
import { Wallet } from "lucide-react";

const ASSETS = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC"] as const;

const STATUS_TONE: Record<string, "amber" | "green" | "red" | "neutral"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { authId } = await requireUser();
  const { ok, error } = await searchParams;
  const [balances, history] = await Promise.all([getBalances(authId), getBalanceHistory(authId)]);

  return (
    <>
      <PageHeader title="My Wallet" description="Your platform balances and deposit requests." />
      <div className="space-y-6 p-6">
        {ok === "requested" && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Deposit request submitted. Your balance updates once an escrow officer approves it.
          </div>
        )}
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {/* Balances */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ASSETS.map((a) => {
            const bal = balances.find((b) => b.asset === a);
            const amount = Number(bal?.amount ?? 0);
            return (
              <Card key={a} elevated>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{a}</div>
                    <div className="mt-1 font-serif text-2xl font-bold text-navy">{amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-tint text-navy">
                    <Wallet className="h-5 w-5" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Request deposit */}
          <Card elevated>
            <CardHeader><CardTitle>Request a Deposit</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 rounded-lg bg-gold-tint px-3 py-2 text-xs text-navy">
                Send your coins to the platform deposit address, then submit this so we can verify and
                credit your balance manually.
              </p>
              <form action={requestDepositAction} className="space-y-3">
                <div>
                  <Label htmlFor="asset">Asset</Label>
                  <Select id="asset" name="asset" defaultValue="USDT">
                    {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.00000001" min="0" required />
                </div>
                <div>
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input id="note" name="note" placeholder="e.g. tx reference" />
                </div>
                <Button type="submit" className="w-full">Submit Deposit Request</Button>
              </form>
            </CardContent>
          </Card>

          {/* History */}
          <Card elevated className="lg:col-span-2">
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 && <p className="text-sm text-gray-400">No transactions yet.</p>}
              {history.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">
                      {Number(t.amount) >= 0 ? "+" : ""}{Number(t.amount).toLocaleString(undefined, { maximumFractionDigits: 8 })} {t.asset}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">{t.tx_type.replaceAll("_", " ")}</span>
                    <div className="text-xs text-gray-400">{formatDate(t.created_at)}{t.note ? ` · ${t.note}` : ""}</div>
                  </div>
                  <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
