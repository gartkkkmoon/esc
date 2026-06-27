import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveDepositAction, rejectDepositAction, adjustBalanceAction } from "@/lib/data/balances";

const ASSETS = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC"] as const;

export default async function AdminBalancesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const db = createAdminClient();

  const [{ data: pending }, { data: balances }, { data: users }] = await Promise.all([
    db.from("balance_transactions").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    db.from("user_balances").select("*").gt("amount", 0).order("updated_at", { ascending: false }),
    db.from("profiles").select("id, full_name, email").order("full_name"),
  ]);

  const nameById = new Map((users ?? []).map((u) => [u.id, u.full_name || u.email]));

  return (
    <>
      <PageHeader title="Balances" description="Approve deposits and manage user platform balances." />
      <div className="space-y-6 p-6">
        {ok && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Deposit {ok}.</div>}
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {/* Pending deposits */}
        <Card elevated>
          <CardHeader><CardTitle>Pending Deposit Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(pending ?? []).length === 0 && <p className="text-sm text-gray-400">No deposits awaiting approval.</p>}
            {(pending ?? []).map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-soft px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{nameById.get(t.user_id) ?? t.user_id}</span>
                  <span className="ml-2 font-semibold text-navy">
                    {Number(t.amount).toLocaleString(undefined, { maximumFractionDigits: 8 })} {t.asset}
                  </span>
                  <div className="text-xs text-gray-400">{formatDate(t.created_at)}{t.note ? ` · ${t.note}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  <form action={approveDepositAction.bind(null, t.id)}>
                    <Button type="submit" variant="success" size="sm">Approve</Button>
                  </form>
                  <form action={rejectDepositAction.bind(null, t.id)}>
                    <Button type="submit" variant="danger" size="sm">Reject</Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Adjust balance */}
          <Card elevated>
            <CardHeader><CardTitle>Adjust a Balance</CardTitle></CardHeader>
            <CardContent>
              <form action={adjustBalanceAction} className="space-y-3">
                <div>
                  <Label htmlFor="user_id">User</Label>
                  <Select id="user_id" name="user_id" required>
                    <option value="">Select user…</option>
                    {(users ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="asset">Asset</Label>
                  <Select id="asset" name="asset" defaultValue="USDT">
                    {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (negative to debit)</Label>
                  <Input id="amount" name="amount" type="number" step="0.00000001" required placeholder="e.g. 100 or -50" />
                </div>
                <div>
                  <Label htmlFor="note">Note</Label>
                  <Input id="note" name="note" placeholder="reason" />
                </div>
                <Button type="submit" className="w-full">Apply Adjustment</Button>
              </form>
            </CardContent>
          </Card>

          {/* All balances */}
          <Card elevated className="lg:col-span-2">
            <CardHeader><CardTitle>User Balances</CardTitle></CardHeader>
            <CardContent className="!p-0">
              <Table className="border-0">
                <Thead><tr><Th>User</Th><Th>Asset</Th><Th>Balance</Th><Th>Updated</Th></tr></Thead>
                <tbody>
                  {(balances ?? []).map((b) => (
                    <Tr key={b.id}>
                      <Td>{nameById.get(b.user_id) ?? b.user_id}</Td>
                      <Td><Badge tone="navy">{b.asset}</Badge></Td>
                      <Td className="font-medium">{Number(b.amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</Td>
                      <Td>{formatDate(b.updated_at)}</Td>
                    </Tr>
                  ))}
                  {(balances ?? []).length === 0 && (
                    <Tr><Td colSpan={4} className="py-8 text-center text-gray-400">No balances yet.</Td></Tr>
                  )}
                </tbody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
