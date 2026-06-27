import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateSettingAction } from "@/lib/data/settings";

const LABELS: Record<string, string> = {
  kyc_threshold_usd: "KYC Threshold (USD)",
  supported_crypto_assets: "Supported Crypto Assets (JSON array)",
  invite_link_expiration_days: "Invite Link Expiration (days)",
  platform_fee_percent: "Platform Fee (%)",
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").order("key");

  return (
    <>
      <PageHeader title="Platform Settings" description="Manual review thresholds and platform configuration." />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        {(settings ?? []).map((s) => (
          <Card key={s.key}>
            <CardHeader><CardTitle>{LABELS[s.key] ?? s.key}</CardTitle></CardHeader>
            <CardContent>
              <form action={updateSettingAction.bind(null, s.key)} className="flex gap-2">
                <Input name="value" defaultValue={JSON.stringify(s.value)} />
                <Button type="submit" variant="outline">Save</Button>
              </form>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader><CardTitle>Admin Roles</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Manage roles via <Label className="inline">Users</Label> → assign the <code>admin</code>, <code>compliance</code>, or <code>mediator</code> role directly in Supabase, or extend this page with a role-assignment form.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
