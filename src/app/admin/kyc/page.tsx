import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { AdminActionButton } from "@/components/admin/action-button";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { performUserActionAction } from "@/lib/data/admin-users";

export default async function AdminKycQueuePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("kyc_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  const userIds = [...new Set((submissions ?? []).map((s) => s.user_id))];
  const { data: users } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] };
  const userOf = (id: string) => users?.find((u) => u.id === id);

  return (
    <>
      <PageHeader title="KYC Review Queue" description="Manually approve or reject submitted identity documents." />
      <div className="grid gap-4 p-6">
        {(submissions ?? []).map((s) => {
          const user = userOf(s.user_id);
          return (
            <Card key={s.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{user?.full_name || user?.email || s.user_id}</CardTitle>
                <StatusBadge status={s.status} />
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2 text-sm lg:col-span-2">
                  <Doc label="Government ID" url={s.id_document_url} />
                  <Doc label="Passport / National ID" url={s.passport_url} />
                  <Doc label="Proof of Address" url={s.proof_of_address_url} />
                  <Doc label="Selfie" url={s.selfie_url} />
                  <Doc label="Liveness Check" url={s.liveness_check_url} />
                  <p className="text-xs text-gray-400">Submitted {formatDate(s.submitted_at)}</p>
                  {s.compliance_notes && <p className="text-xs text-amber-700">Notes: {s.compliance_notes}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <AdminActionButton label="Approve KYC" action={performUserActionAction.bind(null, s.user_id, "approve_kyc")} variant="success" />
                  <AdminActionButton label="Reject KYC" action={performUserActionAction.bind(null, s.user_id, "reject_kyc")} variant="danger" />
                  <AdminActionButton label="Request More Info" action={performUserActionAction.bind(null, s.user_id, "request_more_kyc_info")} />
                  <Link href={`/admin/users/${s.user_id}`} className="text-center text-sm text-navy underline">View full profile</Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(submissions ?? []).length === 0 && <p className="text-sm text-gray-400">No KYC submissions yet.</p>}
      </div>
    </>
  );
}

function Doc({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2">
      <span className="text-gray-500">{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="font-medium text-navy underline">View</a>
      ) : (
        <span className="text-gray-300">Not submitted</span>
      )}
    </div>
  );
}
