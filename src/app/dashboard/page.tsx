import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActionCenter } from "@/components/dashboard/action-center";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { FileStack, Activity, Wallet, Clock4 } from "lucide-react";

export default async function BuyerDashboardPage() {
  const { authId } = await requireUser();
  const supabase = await createClient();

  const { data: contracts } = await supabase
    .from("escrow_contracts")
    .select("*")
    .or(`buyer_id.eq.${authId},seller_id.eq.${authId}`)
    .order("created_at", { ascending: false });

  const list = contracts ?? [];
  const active = list.filter((c) => !["completed", "cancelled", "closed", "refunded"].includes(c.status));
  const totalUsd = list.reduce((sum, c) => sum + Number(c.amount_usd ?? 0), 0);
  const needsAction = list.filter((c) =>
    ["waiting_for_deposit", "deposit_pending", "release_requested"].includes(c.status)
  );
  const recent = list.slice(0, 8);

  return (
    <>
      <PageHeader
        title="My Escrow Contracts"
        description="Track contracts you've created or joined."
        actions={
          <Link href="/dashboard/contracts/new">
            <Button>New Contract</Button>
          </Link>
        }
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Contracts" value={String(list.length)} icon={<FileStack className="h-5 w-5" />} />
        <StatCard label="Active" value={String(active.length)} icon={<Activity className="h-5 w-5" />} trend={active.length > 0 ? `${active.length} in progress` : undefined} />
        <StatCard label="Total Volume" value={formatUsd(totalUsd)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Needs Your Action" value={String(needsAction.length)} icon={<Clock4 className="h-5 w-5" />} tone={needsAction.length > 0 ? "amber" : "default"} />
      </div>

      <div className="grid gap-6 p-6 pt-0 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="!p-0">
            <Table className="border-0">
              <Thead>
                <tr>
                  <Th>Contract</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Created</Th>
                  <Th></Th>
                </tr>
              </Thead>
              <tbody>
                {recent.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <div className="font-medium text-gray-900">{c.title}</div>
                      <div className="text-xs text-gray-400">{c.contract_number}</div>
                    </Td>
                    <Td>{formatUsd(c.amount_usd)} <span className="text-gray-400">· {c.crypto_asset}</span></Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td><StatusBadge status={c.payment_status} /></Td>
                    <Td>{formatDate(c.created_at)}</Td>
                    <Td>
                      <Link href={`/dashboard/contracts/${c.id}`} className="text-sm font-medium text-navy hover:underline">
                        View
                      </Link>
                    </Td>
                  </Tr>
                ))}
                {recent.length === 0 && (
                  <Tr><Td colSpan={6} className="py-10 text-center text-gray-400">No contracts yet. Create your first escrow contract.</Td></Tr>
                )}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <ActionCenter
          title="Market Action Center"
          items={[
            { label: "Deposits awaiting confirmation", count: list.filter((c) => ["deposit_pending", "blockchain_confirming"].includes(c.status)).length, href: "/dashboard/contracts" },
            { label: "Release requests pending", count: list.filter((c) => c.status === "release_requested").length, href: "/dashboard/contracts" },
            { label: "Contracts awaiting seller", count: list.filter((c) => c.status === "waiting_for_seller").length, href: "/dashboard/contracts" },
          ]}
        />
      </div>
    </>
  );
}
