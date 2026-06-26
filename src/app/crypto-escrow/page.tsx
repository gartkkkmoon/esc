import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ShieldCheck, UserCheck, Eye, Coins, Lock, Scale, Clock } from "lucide-react";

const ASSETS = ["BTC", "ETH", "USDT", "USDC", "SOL", "XRP", "LTC"];

export default function CryptoEscrowPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border-soft bg-navy-900">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #060b1c 0%, #0b1530 50%, #131f45 100%)",
            }}
          />
          {/* photo-collage placeholder blocks */}
          <div className="absolute -right-16 top-8 h-56 w-56 rounded-3xl bg-gradient-to-br from-gold/30 to-transparent blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">Crypto Escrow</p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Secure Cryptocurrency Escrow, Built on Decades of Trust
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Buyer and seller open an escrow contract together. Funds are confirmed on-chain,
              reviewed by our team, and released manually — never automatically.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-white hover:opacity-90"
              >
                Create Escrow
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-medium text-white hover:bg-white/10"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-background py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-navy">How It Works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <Step n={1} icon={<Lock className="h-5 w-5 text-gold" />} title="Buyer Creates Contract" desc="Set the asset, amount, and terms, then invite the seller via a secure link." />
              <Step n={2} icon={<Scale className="h-5 w-5 text-gold" />} title="Seller Joins & Funds Confirm" desc="Seller accepts terms. Buyer sends crypto; our team confirms the deposit on-chain." />
              <Step n={3} icon={<Clock className="h-5 w-5 text-gold" />} title="Admin Manually Releases" desc="Once delivery is confirmed, an admin manually releases funds to the seller." />
            </div>
          </div>
        </section>

        <section className="border-t border-border-soft bg-white py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-navy">Why Choose Us</h2>
            <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
              <div className="rounded-2xl border border-border-soft bg-background p-8">
                <h3 className="text-lg font-semibold text-navy">Identity Verification (KYC)</h3>
                <ul className="mt-3 space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2"><UserCheck className="h-4 w-4 shrink-0 text-gold" /> Transactions of $100 USD or less may proceed without KYC.</li>
                  <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-gold" /> Transactions above $100 USD require identity verification before continuing.</li>
                  <li className="flex gap-2"><Eye className="h-4 w-4 shrink-0 text-gold" /> All KYC submissions are reviewed manually by our compliance team.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border-soft bg-background p-8">
                <h3 className="text-lg font-semibold text-navy">Supported Assets</h3>
                <p className="mt-2 text-sm text-gray-500">We support the most widely used cryptocurrencies for escrow transactions.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ASSETS.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-full bg-gold-tint px-3 py-1 text-sm font-medium text-navy">
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

function Step({ n, icon, title, desc }: { n: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
          {n}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-tint">{icon}</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
