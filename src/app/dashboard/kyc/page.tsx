import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { submitKycAction } from "@/lib/data/kyc";
import { ShieldCheck, IdCard, ScanFace, FileText } from "lucide-react";

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

  return (
    <>
      <PageHeader title="Identity Verification (KYC)" description="Required for transactions above $100 USD." />
      <div className="max-w-2xl p-6">
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
              <p className="font-medium text-emerald-700">Your identity has been verified. You can proceed with transactions of any amount.</p>
            )}

            {status === "rejected" && (
              <div className="rounded-lg bg-red-50 p-3 text-red-700">
                Your KYC submission was rejected. {latest?.compliance_notes && <>Reason: {latest.compliance_notes}</>}
                <p className="mt-2">Please resubmit your documents below.</p>
              </div>
            )}

            {status === "needs_more_info" && (
              <div className="rounded-lg bg-amber-50 p-3 text-amber-800">
                Compliance needs more information. {latest?.compliance_notes}
              </div>
            )}

            {status === "pending" && (
              <p className="font-medium text-amber-700">
                Your documents were submitted on {formatDate(latest?.submitted_at)} and are pending manual review.
              </p>
            )}

            {(status === "required" || status === "rejected" || status === "needs_more_info" || status === "not_required") && (
              <form action={submitKycAction} encType="multipart/form-data" className="space-y-4 border-t border-border-soft pt-4">
                <FieldGroup icon={<IdCard className="h-4 w-4" />} label="Government ID / Driver's License" name="id_document" />
                <FieldGroup icon={<FileText className="h-4 w-4" />} label="Passport or National ID (optional)" name="passport" />
                <FieldGroup icon={<FileText className="h-4 w-4" />} label="Proof of Address" name="proof_of_address" />
                <FieldGroup icon={<ScanFace className="h-4 w-4" />} label="Selfie" name="selfie" />
                <FieldGroup icon={<ScanFace className="h-4 w-4" />} label="Liveness Check / Video" name="liveness_check" />
                <p className="text-xs text-gray-400">
                  Files are uploaded to a private, access-controlled storage bucket and are only viewable by you and compliance staff. All submissions are reviewed manually.
                </p>
                <Button type="submit" className="w-full">Submit for Manual Review</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function FieldGroup({ icon, label, name }: { icon: React.ReactNode; label: string; name: string }) {
  return (
    <div>
      <Label htmlFor={name} className="flex items-center gap-2">{icon}{label}</Label>
      <Input id={name} name={name} type="file" accept="image/*,.pdf" />
    </div>
  );
}
