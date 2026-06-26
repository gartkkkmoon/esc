import { AuthShell } from "@/components/marketing/auth-shell";
import { Button } from "@/components/ui/button";
import { resendVerificationEmailAction } from "@/lib/auth/actions";
import { MailCheck } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const { email, sent } = await searchParams;

  return (
    <AuthShell title="Check your email" subtitle="Confirm your address to activate your account.">
      <div className="space-y-4 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-gold" />
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <span className="font-medium text-navy">{email || "your email address"}</span>.
          Click the link to verify your account, then log in.
        </p>
        {sent === "1" && <p className="text-sm font-medium text-emerald-700">Verification email resent.</p>}
        <form action={resendVerificationEmailAction}>
          <input type="hidden" name="email" value={email || ""} />
          <Button type="submit" variant="outline" className="w-full">Resend verification email</Button>
        </form>
        <a href="/login" className="block text-sm text-navy underline">Back to log in</a>
      </div>
    </AuthShell>
  );
}
