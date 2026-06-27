import Link from "next/link";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActionCenter } from "@/components/dashboard/action-center";
import { formatUsd, formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { FileStack, DollarSign, Clock4, AlertTriangle, ShieldAlert, CheckCircle2, Wallet, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminClient();

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
        <StatCard label="Total Escrow Contracts" value={String(list.length)} icon={<FileStack className="h-5 w-5" />} />
        <StatCard label="Total Volume" value={formatUsd(totalVolume)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Pending Review" value={String(pendingReview)} icon={<Clock4 className="h-5 w-5" />} tone="amber" />
        <StatCard label="Disputes Open" value={String(disputesOpen?.length ?? 0)} icon={<AlertTriangle className="h-5 w-5" />} tone="red" />
        <StatCard label="KYC Pending" value={String(kycPending?.length ?? 0)} icon={<ShieldAlert className="h-5 w-5" />} tone="amber" />
        <StatCard label="Completed This Month" value={String(completedThisMonth)} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard label="Total Escrow Balance Held" value={formatUsd(escrowBalance)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Active Contracts" value={String(list.filter((c) => !["completed", "cancelled", "closed", "refunded"].includes(c.status)).length)} icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 p-6 pt-0 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
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

        <ActionCenter
          title="Market Action Center"
          items={[
            { label: "KYC submissions awaiting review", count: kycPending?.length ?? 0, href: "/admin/kyc" },
            { label: "Contracts awaiting admin review", count: pendingReview, href: "/admin/contracts" },
            { label: "Open disputes", count: disputesOpen?.length ?? 0, href: "/admin/disputes" },
          ]}
        />
      </div>
    </>
  );
}
