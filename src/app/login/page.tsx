import Link from "next/link";
import { AuthShell } from "@/components/marketing/auth-shell";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;
  return (
    <AuthShell title="Log in" subtitle="Access your buyer, seller, or admin dashboard.">
      {registered && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Account created. Check your email to verify, then log in.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <form action={signInAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full">Log in</Button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-navy hover:underline">Forgot password?</Link>
        <Link href="/register" className="text-navy hover:underline">Create account</Link>
      </div>
      <p className="mt-6 text-center text-xs text-gray-400">
        Two-factor authentication is available after sign-in in account settings.
      </p>
    </AuthShell>
  );
}
