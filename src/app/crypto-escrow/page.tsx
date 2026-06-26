import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ShieldCheck, UserCheck, Eye, Coins } from "lucide-react";

const ASSETS = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC"];

export default function CryptoEscrowPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border-soft bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">Crypto Escrow</p>
            <h1 className="mt-4 text-3xl font-semibold text-navy md:text-4xl">
              Secure Cryptocurrency Escrow, Built on Decades of Trust
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Buyer and seller open an escrow contract together. Funds are confirmed on-chain,
              reviewed by our team, and released manually — never automatically.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-navy px-6 text-sm font-medium text-white hover:bg-navy-light"
              >
                Create Escrow
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border-soft px-6 text-sm font-medium text-navy hover:bg-gray-50"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-background py-14">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-navy">How It Works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <Step n={1} title="Buyer Creates Contract" desc="Set the asset, amount, and terms, then invite the seller via a secure link." />
              <Step n={2} title="Seller Joins & Funds Confirm" desc="Seller accepts terms. Buyer sends crypto; our team confirms the deposit on-chain." />
              <Step n={3} title="Admin Manually Releases" desc="Once delivery is confirmed, an admin manually releases funds to the seller." />
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-border-soft bg-white p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-navy">Identity Verification (KYC)</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2"><UserCheck className="h-4 w-4 shrink-0 text-gold" /> Transactions of $100 USD or less may proceed without KYC.</li>
                  <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-gold" /> Transactions above $100 USD require identity verification before continuing.</li>
                  <li className="flex gap-2"><Eye className="h-4 w-4 shrink-0 text-gold" /> All KYC submissions are reviewed manually by our compliance team.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy">Supported Assets</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ASSETS.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1 text-sm font-medium text-navy">
                      <Coins className="h-3.5 w-3.5" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-white p-6">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
        {n}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
