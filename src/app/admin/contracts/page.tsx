import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment_status?: string; disputed?: string }>;
}) {
  await requireAdmin();
  const { status, payment_status, disputed } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase.from("escrow_contracts").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (payment_status) query = query.eq("payment_status", payment_status);
  if (disputed === "1") query = query.eq("status", "disputed");

  const { data: contracts } = await query;
  const list = contracts ?? [];

  const buyerIds = [...new Set(list.map((c) => c.buyer_id).filter(Boolean))];
  const sellerIds = [...new Set(list.map((c) => c.seller_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", [...buyerIds, ...sellerIds] as string[]);
  const nameOf = (id: string | null) => profiles?.find((p) => p.id === id)?.full_name ?? "—";

  return (
    <>
      <PageHeader
        title="All Contracts"
        description={`${list.length} contracts`}
        actions={
          <Link href="/admin/contracts/new">
            <Button>Create Contract</Button>
          </Link>
        }
      />
      <form className="flex flex-wrap gap-3 p-6 pb-0">
        <Select name="status" defaultValue={status ?? ""} className="w-48">
          <option value="">All statuses</option>
          {["draft","waiting_for_seller","seller_joined","active_escrow","release_requested","released","completed","disputed","cancelled","refunded"].map((s) => (
            <option key={s} value={s}>{s.replaceAll("_"," ")}</option>
          ))}
        </Select>
        <Select name="payment_status" defaultValue={payment_status ?? ""} className="w-44">
          <option value="">All payment statuses</option>
          {["unpaid","pending","paid","failed","refunded","released"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline">Apply Filters</Button>
      </form>

      <div className="p-6">
        <Table>
          <Thead>
            <tr>
              <Th>Contract</Th>
              <Th>Buyer</Th>
              <Th>Seller</Th>
              <Th>Asset</Th>
              <Th>USD Value</Th>
              <Th>Status</Th>
              <Th>KYC</Th>
              <Th>Payment</Th>
              <Th>Created</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {list.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-gray-900">{c.contract_number}</Td>
                <Td>{nameOf(c.buyer_id)}</Td>
                <Td>{nameOf(c.seller_id)}</Td>
                <Td>{c.crypto_asset}</Td>
                <Td>{formatUsd(c.amount_usd)}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td><StatusBadge status={c.kyc_requirement} /></Td>
                <Td><StatusBadge status={c.payment_status} /></Td>
                <Td>{formatDate(c.created_at)}</Td>
                <Td><Link href={`/admin/contracts/${c.id}`} className="font-medium text-navy hover:underline">Review</Link></Td>
              </Tr>
            ))}
            {list.length === 0 && (
              <Tr><Td colSpan={10} className="py-10 text-center text-gray-400">No contracts match these filters.</Td></Tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
