import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminWalletsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: wallets }, { data: pendingDeposits }, { data: pendingReleases }] = await Promise.all([
    supabase.from("wallet_addresses").select("*").order("created_at", { ascending: false }),
    supabase.from("escrow_contracts").select("*").in("status", ["deposit_pending", "blockchain_confirming"]),
    supabase.from("escrow_contracts").select("*").in("status", ["release_requested", "admin_reviewing_release"]),
  ]);

  return (
    <>
      <PageHeader title="Wallets" description="Platform deposit addresses and the manual release queue." />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card>
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
        <Card>
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

      <div className="p-6 pt-0">
        <Table>
          <Thead><tr><Th>Asset</Th><Th>Address</Th><Th>Network</Th><Th>Label</Th><Th>Platform Wallet</Th></tr></Thead>
          <tbody>
            {(wallets ?? []).map((w) => (
              <Tr key={w.id}>
                <Td>{w.crypto_asset}</Td>
                <Td className="font-mono text-xs">{w.address}</Td>
                <Td>{w.network ?? "—"}</Td>
                <Td>{w.label ?? "—"}</Td>
                <Td>{w.is_platform_wallet ? "Yes" : "No"}</Td>
              </Tr>
            ))}
            {(wallets ?? []).length === 0 && (
              <Tr><Td colSpan={5} className="py-10 text-center text-gray-400">No wallet addresses configured yet.</Td></Tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
