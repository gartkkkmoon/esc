import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Users" description={`${users?.length ?? 0} registered users`} />
      <div className="p-6">
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Account Status</Th>
              <Th>Verified</Th>
              <Th>KYC</Th>
              <Th>Joined</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {(users ?? []).map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium text-gray-900">{u.full_name || "—"}</Td>
                <Td>{u.email}</Td>
                <Td><StatusBadge status={u.account_status} /></Td>
                <Td>{u.is_verified ? <Badge tone="green">Verified</Badge> : <Badge tone="neutral">Unverified</Badge>}</Td>
                <Td><StatusBadge status={u.kyc_status} /></Td>
                <Td>{formatDate(u.created_at)}</Td>
                <Td><Link href={`/admin/users/${u.id}`} className="font-medium text-navy hover:underline">Manage</Link></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
