import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: contracts }, { data: kycPending }, { data: disputesOpen }] = await Promise.all([
    supabase.from("escrow_contracts").select("*").order("created_at", { ascending: false }),
    supabase.from("kyc_submissions").select("id").eq("status", "pending"),
    supabase.from("disputes").select("id").not("status", "in", "(resolved,closed)"),
  ]);

  const list = contracts ?? [];
  const totalVolume = list.reduce((s, c) => s + Number(c.amount_usd ?? 0), 0);
  const pendingReview = list.filter((c) =>
    ["admin_reviewing", "admin_reviewing_release", "deposit_pending", "blockchain_confirming"].includes(c.status)
  ).length;
  const completedThisMonth = list.filter((c) => {
    if (c.status !== "completed") return false;
    const d = new Date(c.updated_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const escrowBalance = list
    .filter((c) => c.payment_status === "paid")
    .reduce((s, c) => s + Number(c.amount_usd ?? 0), 0);

  const recent = list.slice(0, 8);

  return (
    <>
      <PageHeader title="Admin Dashboard" description="Platform-wide overview and manual review queue." />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Escrow Contracts" value={String(list.length)} />
        <Stat label="Total Volume" value={formatUsd(totalVolume)} />
        <Stat label="Pending Review" value={String(pendingReview)} tone="amber" />
        <Stat label="Disputes Open" value={String(disputesOpen?.length ?? 0)} tone="red" />
        <Stat label="KYC Pending" value={String(kycPending?.length ?? 0)} tone="amber" />
        <Stat label="Completed This Month" value={String(completedThisMonth)} tone="green" />
        <Stat label="Total Escrow Balance Held" value={formatUsd(escrowBalance)} />
        <Stat label="Active Contracts" value={String(list.filter((c) => !["completed", "cancelled", "closed", "refunded"].includes(c.status)).length)} />
      </div>

      <div className="grid gap-6 p-6 pt-0 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Escrow Contracts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recent.map((c) => (
              <Link
                key={c.id}
                href={`/admin/contracts/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{c.contract_number} · {c.title}</div>
                  <div className="text-xs text-gray-400">{formatDate(c.created_at)} · {formatUsd(c.amount_usd)}</div>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
            {recent.length === 0 && <p className="text-sm text-gray-400">No contracts yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Manual Action Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Alert label="KYC submissions awaiting review" count={kycPending?.length ?? 0} href="/admin/kyc" />
            <Alert label="Contracts awaiting admin review" count={pendingReview} href="/admin/contracts" />
            <Alert label="Open disputes" count={disputesOpen?.length ?? 0} href="/admin/disputes" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "amber" | "red" | "green" }) {
  const toneClass = tone === "amber" ? "text-amber-600" : tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-gray-900";
  return (
    <Card>
      <CardContent>
        <div className="text-sm text-gray-500">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Alert({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 hover:bg-gray-100">
      <span className="text-gray-700">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${count > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-500"}`}>
        {count}
      </span>
    </Link>
  );
}
