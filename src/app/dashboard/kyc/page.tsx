import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { KycWizard } from "@/components/kyc/kyc-wizard";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { submitKycAction } from "@/lib/data/kyc";
import { ShieldCheck, Clock4, XCircle, AlertCircle } from "lucide-react";

export default async function KycPage() {
  const { authId, profile } = await requireUser();
  const supabase = await createClient();

  const { data: latest } = await supabase
    .from("kyc_submissions")
    .select("*")
    .eq("user_id", authId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  const status = profile?.kyc_status ?? "not_required";

  const needsSubmission =
    status === "required" || status === "rejected" || status === "needs_more_info" || status === "not_required";

  return (
    <>
      <PageHeader title="Identity Verification (KYC)" description="Required for transactions above $100 USD." />
      <div className="max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Verification Status</CardTitle>
            <StatusBadge status={status} />
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3 rounded-lg bg-gray-50 p-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
              <p>Transactions of $100 USD or less may proceed without identity verification. Transactions above $100 USD require KYC before continuing.</p>
            </div>

            {status === "approved" && (
              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="font-medium text-emerald-700">
                  Your identity has been verified. You can proceed with transactions of any amount.
                </p>
              </div>
            )}

            {status === "rejected" && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-red-700">
                <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                <div>
                  Your KYC submission was rejected. {latest?.compliance_notes && <>Reason: {latest.compliance_notes}</>}
                  <p className="mt-2">Please resubmit your documents below.</p>
                </div>
              </div>
            )}

            {status === "needs_more_info" && (
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <p>Compliance needs more information. {latest?.compliance_notes}</p>
              </div>
            )}

            {status === "pending" && (
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                <Clock4 className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="font-medium text-amber-700">
                  Your documents were submitted on {formatDate(latest?.submitted_at)} and are pending manual review.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {needsSubmission && <KycWizard action={submitKycAction} />}
      </div>
    </>
  );
}
