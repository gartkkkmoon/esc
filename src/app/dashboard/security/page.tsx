import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { toggleTwoFactorAction } from "@/lib/data/security";
import { ShieldCheck } from "lucide-react";

export default async function SecurityPage() {
  const { profile } = await requireUser();

  return (
    <>
      <PageHeader title="Security" description="Manage how you sign in and protect your account." />
      <div className="max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Two-Factor Authentication</CardTitle>
            <Badge tone={profile?.two_factor_enabled ? "green" : "neutral"}>
              {profile?.two_factor_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              Add an extra layer of protection to your account with an authenticator app. This is a UI placeholder for MVP —
              TOTP enrollment and verification will be wired up to a real authenticator flow in a future release.
            </p>
            <form action={toggleTwoFactorAction}>
              <input type="hidden" name="enabled" value={(!profile?.two_factor_enabled).toString()} />
              <Button type="submit" variant={profile?.two_factor_enabled ? "outline" : "primary"} size="sm">
                {profile?.two_factor_enabled ? "Disable Two-Factor" : "Enable Two-Factor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
