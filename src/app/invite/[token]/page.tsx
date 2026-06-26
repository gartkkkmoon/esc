import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatUsd, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { acceptInviteAction, declineInviteAction } from "@/lib/data/contracts";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; declined?: string }>;
}) {
  const { token } = await params;
  const { error, declined } = await searchParams;
  const supabase = await createClient();

  const { data: invite } = await supabase.from("contract_invites").select("*").eq("token", token).single();
  if (!invite) notFound();

  const { data: contract } = await supabase
    .from("escrow_contracts")
    .select("*")
    .eq("id", invite.contract_id)
    .single();
  if (!contract) notFound();

  const user = await getCurrentUser();
  const expired = new Date(invite.expires_at) < new Date();
  const used = !!invite.used_at;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-2xl px-6">
          <Card>
            <CardHeader>
              <CardTitle>You&apos;ve been invited to an escrow contract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              {declined && <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">Invite declined.</div>}

              <div>
                <div className="text-lg font-semibold text-navy">{contract.title}</div>
                <div className="text-sm text-gray-500">{contract.contract_number}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-gray-400">Amount</div><div className="font-medium">{formatUsd(contract.amount_usd)} ({contract.amount_crypto} {contract.crypto_asset})</div></div>
                <div><div className="text-xs text-gray-400">Status</div><StatusBadge status={contract.status} /></div>
                <div><div className="text-xs text-gray-400">Invited as</div><div className="font-medium">{invite.seller_email}</div></div>
                <div><div className="text-xs text-gray-400">Expires</div><div className="font-medium">{formatDate(invite.expires_at)}</div></div>
              </div>
              {contract.description && <p className="text-sm text-gray-600">{contract.description}</p>}

              {expired || used ? (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  This invite link is {used ? "already used" : "expired"}. Contact the buyer for a new link.
                </div>
              ) : !user ? (
                <div className="flex gap-3">
                  <Link href={`/register?next=/invite/${token}`} className="flex-1">
                    <Button className="w-full">Create Account to Join</Button>
                  </Link>
                  <Link href={`/login?next=/invite/${token}`} className="flex-1">
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-3">
                  <form action={acceptInviteAction.bind(null, token)} className="flex-1">
                    <Button type="submit" variant="success" className="w-full">Accept &amp; Join Contract</Button>
                  </form>
                  <form action={declineInviteAction.bind(null, token)} className="flex-1">
                    <Button type="submit" variant="outline" className="w-full">Decline</Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
