import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <Card><CardContent><div className="text-sm text-gray-500">Total Contracts</div><div className="mt-1 text-2xl font-semibold">{list.length}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Active</div><div className="mt-1 text-2xl font-semibold">{active.length}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Total Volume</div><div className="mt-1 text-2xl font-semibold">{formatUsd(totalUsd)}</div></CardContent></Card>
      </div>

      <div className="p-6 pt-0">
        <Table>
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
            {list.map((c) => (
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
            {list.length === 0 && (
              <Tr><Td colSpan={6} className="py-10 text-center text-gray-400">No contracts yet. Create your first escrow contract.</Td></Tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
