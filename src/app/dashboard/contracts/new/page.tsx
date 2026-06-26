import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createContractAction } from "@/lib/data/contracts";

const ASSETS = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC"];

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <PageHeader title="Create Escrow Contract" description="Set the terms, then invite the seller." />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <form action={createContractAction} className="space-y-5">
              <div>
                <Label htmlFor="title">Contract title</Label>
                <Input id="title" name="title" required placeholder="e.g. 2.5 BTC for Web Domain Purchase" />
              </div>

              <div>
                <Label htmlFor="seller_email">Seller email</Label>
                <Input id="seller_email" name="seller_email" type="email" required placeholder="seller@example.com" />
                <p className="mt-1 text-xs text-gray-400">A secure invite link will be sent after creation.</p>
              </div>

              <div>
                <Label htmlFor="description">Description / asset being exchanged</Label>
                <Textarea id="description" name="description" rows={3} placeholder="Describe what is being purchased or exchanged" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crypto_asset">Crypto asset</Label>
                  <Select id="crypto_asset" name="crypto_asset" defaultValue="BTC">
                    {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_network">Payment network</Label>
                  <Input id="payment_network" name="payment_network" placeholder="e.g. Bitcoin mainnet, ERC-20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount_crypto">Amount (crypto)</Label>
                  <Input id="amount_crypto" name="amount_crypto" type="number" step="0.00000001" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="amount_usd">USD value</Label>
                  <Input id="amount_usd" name="amount_usd" type="number" step="0.01" required placeholder="0.00" />
                  <p className="mt-1 text-xs text-gray-400">Above $100 requires KYC before proceeding.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="delivery_terms">Delivery terms</Label>
                <Textarea id="delivery_terms" name="delivery_terms" rows={2} placeholder="How and when will the item/asset be delivered?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspection_period">Inspection period</Label>
                  <Input id="inspection_period" name="inspection_period" placeholder="e.g. 3 days" />
                </div>
                <div>
                  <Label htmlFor="release_conditions">Release conditions</Label>
                  <Input id="release_conditions" name="release_conditions" placeholder="What must happen before release?" />
                </div>
              </div>

              <div>
                <Label htmlFor="dispute_terms">Dispute terms</Label>
                <Textarea id="dispute_terms" name="dispute_terms" rows={2} placeholder="How will disputes be handled?" />
              </div>

              <Button type="submit" className="w-full">Create Contract &amp; Invite Seller</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
