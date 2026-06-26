import { PageHeader } from "@/components/layout/dashboard-shell";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const actorIds = [...new Set((logs ?? []).map((l) => l.actor_id).filter(Boolean))];
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", actorIds as string[])
    : { data: [] };
  const actorName = (id: string | null) => actors?.find((a) => a.id === id)?.full_name ?? id ?? "system";

  return (
    <>
      <PageHeader title="Audit Logs" description="Immutable record of every manual administrative action." />
      <div className="p-6">
        <Table>
          <Thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Reason</Th>
            </tr>
          </Thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <Tr key={log.id}>
                <Td className="whitespace-nowrap text-xs text-gray-500">{formatDate(log.created_at)}</Td>
                <Td>{actorName(log.actor_id)} <span className="text-xs text-gray-400">({log.actor_role})</span></Td>
                <Td className="font-medium text-gray-900">{log.action.replaceAll("_", " ")}</Td>
                <Td className="text-xs text-gray-500">{log.entity_type} · {log.entity_id?.slice(0, 8)}</Td>
                <Td className="max-w-md truncate">{log.reason}</Td>
              </Tr>
            ))}
            {(logs ?? []).length === 0 && (
              <Tr><Td colSpan={5} className="py-10 text-center text-gray-400">No audit events yet.</Td></Tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
