import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDisputesPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: disputes } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
  const contractIds = [...new Set((disputes ?? []).map((d) => d.contract_id))];
  const { data: contracts } = contractIds.length
    ? await supabase.from("escrow_contracts").select("id, contract_number, title").in("id", contractIds)
    : { data: [] };
  const contractOf = (id: string) => contracts?.find((c) => c.id === id);

  return (
    <>
      <PageHeader title="Dispute Center" description="Mediate buyer/seller disputes." />
      <div className="p-6">
        <Table>
          <Thead>
            <tr><Th>Contract</Th><Th>Reason</Th><Th>Status</Th><Th>Opened</Th><Th></Th></tr>
          </Thead>
          <tbody>
            {(disputes ?? []).map((d) => {
              const c = contractOf(d.contract_id);
              return (
                <Tr key={d.id}>
                  <Td className="font-medium text-gray-900">{c?.contract_number} · {c?.title}</Td>
                  <Td className="max-w-sm truncate">{d.reason}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td>{formatDate(d.created_at)}</Td>
                  <Td><Link href={`/admin/disputes/${d.id}`} className="font-medium text-navy hover:underline">Mediate</Link></Td>
                </Tr>
              );
            })}
            {(disputes ?? []).length === 0 && (
              <Tr><Td colSpan={5} className="py-10 text-center text-gray-400">No disputes.</Td></Tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
