import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { addWalletAction, updateWalletAction, deleteWalletAction } from "@/lib/data/wallets";
import { Wallet, Trash2 } from "lucide-react";

const ASSETS = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC"] as const;

export default async function AdminWalletsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const supabase = await createClient();

  const [{ data: wallets }, { data: pendingDeposits }, { data: pendingReleases }] = await Promise.all([
    supabase.from("wallet_addresses").select("*").order("created_at", { ascending: false }),
    supabase.from("escrow_contracts").select("*").in("status", ["deposit_pending", "blockchain_confirming"]),
    supabase.from("escrow_contracts").select("*").in("status", ["release_requested", "admin_reviewing_release"]),
  ]);

  return (
    <>
      <PageHeader title="Wallets" description="Manage the platform deposit addresses buyers and sellers send funds to." />

      <div className="space-y-6 p-6">
        {ok && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Wallet {ok} successfully.
          </div>
        )}
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card elevated>
            <CardHeader><CardTitle>Pending Deposits</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(pendingDeposits ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 text-sm">
                  <span>{c.contract_number} · {c.crypto_asset} · {formatUsd(c.amount_usd)}</span>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {(pendingDeposits ?? []).length === 0 && <p className="text-sm text-gray-400">No pending deposits.</p>}
            </CardContent>
          </Card>
          <Card elevated>
            <CardHeader><CardTitle>Manual Release Queue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(pendingReleases ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 text-sm">
                  <span>{c.contract_number} · {c.crypto_asset} · {formatUsd(c.amount_usd)}</span>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {(pendingReleases ?? []).length === 0 && <p className="text-sm text-gray-400">Nothing awaiting release.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Add a deposit wallet */}
        <Card elevated>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Add Deposit Wallet</CardTitle></CardHeader>
          <CardContent>
            <form action={addWalletAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="crypto_asset">Asset</Label>
                <Select id="crypto_asset" name="crypto_asset" required defaultValue="BTC">
                  {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="address">Deposit address</Label>
                <Input id="address" name="address" placeholder="Wallet address" required />
              </div>
              <div>
                <Label htmlFor="network">Network</Label>
                <Input id="network" name="network" placeholder="e.g. Bitcoin, ERC-20, TRC-20" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="label">Label (optional)</Label>
                <Input id="label" name="label" placeholder="e.g. Main BTC cold wallet" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Add Wallet</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing wallets — editable */}
        <Card elevated>
          <CardHeader><CardTitle>Platform Deposit Addresses</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(wallets ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No wallet addresses configured yet. Add one above.</p>
            )}
            {(wallets ?? []).map((w) => (
              <div key={w.id} className="rounded-lg border border-border-soft p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
                    <Wallet className="h-4 w-4 text-gold" /> {w.crypto_asset}
                    {!w.is_platform_wallet && <span className="text-xs font-normal text-gray-400">(contract-specific)</span>}
                  </span>
                  <form action={deleteWalletAction.bind(null, w.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </form>
                </div>
                <form action={updateWalletAction.bind(null, w.id)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <Label>Address</Label>
                    <Input name="address" defaultValue={w.address} className="font-mono text-xs" required />
                  </div>
                  <div>
                    <Label>Network</Label>
                    <Input name="network" defaultValue={w.network ?? ""} />
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input name="label" defaultValue={w.label ?? ""} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <Button type="submit" variant="outline" size="sm">Save Changes</Button>
                  </div>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
