import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { AdminActionButton } from "@/components/admin/action-button";
import { formatDate, formatUsd } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { performUserActionAction } from "@/lib/data/admin-users";

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  await requireAdmin();
  const supabase = await createClient();

  const { data: user } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!user) notFound();

  const [{ data: contracts }, { data: roles }, { data: notes }, { data: auditLogs }] = await Promise.all([
    supabase.from("escrow_contracts").select("*").or(`buyer_id.eq.${id},seller_id.eq.${id}`),
    supabase.from("user_roles").select("role").eq("user_id", id),
    supabase.from("admin_notes").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").eq("entity_id", id).eq("entity_type", "profile").order("created_at", { ascending: false }),
  ]);

  const totalVolume = (contracts ?? []).reduce((s, c) => s + Number(c.amount_usd ?? 0), 0);
  const bind = (action: Parameters<typeof performUserActionAction>[1]) =>
    performUserActionAction.bind(null, id, action);

  return (
    <>
      <PageHeader
        title={user.full_name || user.email}
        description={user.email}
        actions={<StatusBadge status={user.account_status} />}
      />
      {error && <div className="mx-6 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Full name" value={user.full_name || "—"} />
              <Info label="Email" value={user.email} />
              <Info label="Phone" value={user.phone || "—"} />
              <Info label="Roles" value={(roles ?? []).map((r) => r.role).join(", ") || "buyer"} />
              <Info label="Verified" value={user.is_verified ? <Badge tone="green">Verified</Badge> : <Badge>Unverified</Badge>} />
              <Info label="Account status" value={<StatusBadge status={user.account_status} />} />
              <Info label="KYC status" value={<StatusBadge status={user.kyc_status} />} />
              <Info label="Risk flags" value={user.risk_flags?.length ? user.risk_flags.join(", ") : "None"} />
              <Info label="Created" value={formatDate(user.created_at)} />
              <Info label="Last login" value={formatDate(user.last_login_at)} />
              <Info label="Total contracts" value={String(contracts?.length ?? 0)} />
              <Info label="Total volume" value={formatUsd(totalVolume)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contracts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(contracts ?? []).map((c) => (
                <Link key={c.id} href={`/admin/contracts/${c.id}`} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{c.contract_number} · {c.title}</span>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
              {(contracts ?? []).length === 0 && <p className="text-sm text-gray-400">No contracts.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Audit History</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(auditLogs ?? []).map((log) => (
                <div key={log.id} className="rounded-lg border border-border-soft px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{log.action.replaceAll("_", " ")}</span>
                    <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="mt-1 text-gray-600">{log.reason}</p>
                </div>
              ))}
              {(auditLogs ?? []).length === 0 && <p className="text-gray-400">No actions recorded yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>User Controls</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <AdminActionButton label="Verify User" action={bind("verify_user")} />
              <AdminActionButton label="Unverify User" action={bind("unverify_user")} />
              <AdminActionButton label="Enable User" action={bind("enable_user")} variant="success" />
              <AdminActionButton label="Disable User" action={bind("disable_user")} variant="danger" />
              <AdminActionButton label="Suspend User" action={bind("suspend_user")} variant="danger" />
              <AdminActionButton label="Reactivate User" action={bind("reactivate_user")} variant="success" />
              <AdminActionButton label="Approve KYC" action={bind("approve_kyc")} variant="success" />
              <AdminActionButton label="Reject KYC" action={bind("reject_kyc")} variant="danger" />
              <AdminActionButton label="Request More KYC Info" action={bind("request_more_kyc_info")} />
              <AdminActionButton label="Reset Password" action={bind("reset_password")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(notes ?? []).map((n) => (
                <div key={n.id} className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-gray-700">{n.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(n.created_at)}</p>
                </div>
              ))}
              {(notes ?? []).length === 0 && <p className="text-gray-400">No internal notes yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-0.5 font-medium text-gray-800">{value}</div>
    </div>
  );
}
