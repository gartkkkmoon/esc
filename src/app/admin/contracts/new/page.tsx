import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createContractByAdminAction } from "@/lib/data/admin-actions";

export default async function AdminNewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = createAdminClient();
  const { data: users } = await supabase.from("profiles").select("id, full_name, email").order("full_name");

  return (
    <>
      <PageHeader title="Create Contract Manually" description="Admin-created contracts skip the invite flow." />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardContent>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <form action={createContractByAdminAction} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyer_id">Buyer</Label>
                  <Select id="buyer_id" name="buyer_id" required>
                    <option value="">Select buyer…</option>
                    {(users ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seller_id">Seller (optional)</Label>
                  <Select id="seller_id" name="seller_id">
                    <option value="">Not yet assigned</option>
                    {(users ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crypto_asset">Crypto asset</Label>
                  <Select id="crypto_asset" name="crypto_asset" defaultValue="BTC">
                    {["BTC","ETH","USDT","USDC","SOL","XRP","LTC"].map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount_usd">USD value</Label>
                  <Input id="amount_usd" name="amount_usd" type="number" step="0.01" required />
                </div>
              </div>
              <div>
                <Label htmlFor="amount_crypto">Amount (crypto)</Label>
                <Input id="amount_crypto" name="amount_crypto" type="number" step="0.00000001" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div>
                <Label htmlFor="reason">Reason for manual creation (required)</Label>
                <Textarea id="reason" name="reason" rows={2} required placeholder="e.g. phone-originated deal, migrating an offline contract" />
              </div>
              <Button type="submit" className="w-full">Create Contract</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
