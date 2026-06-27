import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminActionButton } from "@/components/admin/action-button";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { performUserActionAction } from "@/lib/data/admin-users";
import { FileImage, Clock4, ShieldCheck, XCircle } from "lucide-react";

export default async function AdminKycQueuePage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: submissions } = await supabase
    .from("kyc_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  const userIds = [...new Set((submissions ?? []).map((s) => s.user_id))];
  const { data: users } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] };
  const userOf = (id: string) => users?.find((u) => u.id === id);

  const docPaths = (submissions ?? [])
    .flatMap((s) => [s.id_document_url, s.passport_url, s.proof_of_address_url, s.selfie_url, s.liveness_check_url])
    .filter((p): p is string => !!p);
  const signedUrlOf = new Map<string, string>();
  if (docPaths.length) {
    const { data: signed } = await supabase.storage.from("kyc-documents").createSignedUrls(docPaths, 60 * 10);
    signed?.forEach((s, i) => {
      if (s.signedUrl) signedUrlOf.set(docPaths[i], s.signedUrl);
    });
  }

  const all = submissions ?? [];
  const pendingCount = all.filter((s) => s.status === "pending").length;
  const approvedCount = all.filter((s) => s.status === "approved").length;
  const rejectedCount = all.filter((s) => s.status === "rejected").length;

  return (
    <>
      <PageHeader title="Compliance Dashboard" description="Manually approve or reject submitted identity documents." />

      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <StatCard label="Pending Review" value={String(pendingCount)} icon={<Clock4 className="h-5 w-5" />} tone="amber" />
        <StatCard label="Approved" value={String(approvedCount)} icon={<ShieldCheck className="h-5 w-5" />} tone="green" />
        <StatCard label="Rejected" value={String(rejectedCount)} icon={<XCircle className="h-5 w-5" />} tone="red" />
      </div>

      <div className="grid gap-4 p-6 pt-0">
        {all.map((s) => {
          const user = userOf(s.user_id);
          const docs = [
            { label: "Government ID", url: s.id_document_url ? signedUrlOf.get(s.id_document_url) ?? null : null },
            { label: "Passport / National ID", url: s.passport_url ? signedUrlOf.get(s.passport_url) ?? null : null },
            { label: "Proof of Address", url: s.proof_of_address_url ? signedUrlOf.get(s.proof_of_address_url) ?? null : null },
            { label: "Selfie", url: s.selfie_url ? signedUrlOf.get(s.selfie_url) ?? null : null },
            { label: "Liveness Check", url: s.liveness_check_url ? signedUrlOf.get(s.liveness_check_url) ?? null : null },
          ];
          return (
            <Card key={s.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{user?.full_name || user?.email || s.user_id}</CardTitle>
                <StatusBadge status={s.status} />
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3 lg:col-span-2">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {docs.map((d) => (
                      <DocThumbnail key={d.label} label={d.label} url={d.url} />
                    ))}
                  </div>
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
        {all.length === 0 && <p className="text-sm text-gray-400">No KYC submissions yet.</p>}
      </div>
    </>
  );
}

function DocThumbnail({ label, url }: { label: string; url: string | null }) {
  return (
    <a
      href={url ?? undefined}
      target={url ? "_blank" : undefined}
      rel={url ? "noreferrer" : undefined}
      className={`flex flex-col gap-2 rounded-lg border p-2 text-center ${
        url ? "border-border-soft hover:bg-gray-50" : "border-dashed border-border-soft opacity-60"
      }`}
    >
      <div className="flex h-16 items-center justify-center rounded-md bg-gray-50">
        <FileImage className={`h-6 w-6 ${url ? "text-navy" : "text-gray-300"}`} />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <span className={`text-xs ${url ? "font-medium text-navy underline" : "text-gray-300"}`}>
        {url ? "View" : "Not submitted"}
      </span>
    </a>
  );
}
