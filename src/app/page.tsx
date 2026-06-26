import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ShieldCheck, FileCheck2, Globe2, Wallet, UserCheck, FileLock2 } from "lucide-react";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border-soft bg-navy-900">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(176,141,87,0.25), transparent 45%), radial-gradient(circle at 85% 75%, rgba(19,31,69,0.6), transparent 50%), linear-gradient(135deg, #0b1530 0%, #060b1c 60%, #131f45 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Trusted · Secure · Professional
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Two Escrow Services. One Standard of Trust.
              </h1>
              <p className="mt-5 text-lg text-white/70">
                Broker&apos;s Title &amp; Escrow, LLC provides secure escrow solutions for
                real estate transactions and cryptocurrency deals.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <HeroFeature icon={<ShieldCheck className="h-5 w-5 text-gold" />} title="Secure &amp; Compliant" desc="Bonded &amp; insured" />
              <HeroFeature icon={<FileCheck2 className="h-5 w-5 text-gold" />} title="Expert Support" desc="Real people, reviewed by hand" />
              <HeroFeature icon={<Globe2 className="h-5 w-5 text-gold" />} title="Manual Oversight" desc="Every dollar reviewed by staff" />
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-semibold text-navy">
              What type of escrow are you looking for?
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <PathCard
                href="/real-estate-escrow"
                icon={<FileLock2 className="h-6 w-6 text-navy" />}
                title="Real Estate Escrow"
                desc="Secure closings for residential and commercial real estate."
                points={["Residential & Commercial Closings", "Title Insurance", "Experienced Escrow Officers"]}
                cta="Enter Real Estate Escrow"
              />
              <PathCard
                href="/crypto-escrow"
                icon={<Wallet className="h-6 w-6 text-navy" />}
                title="Crypto Escrow"
                desc="Buyer-seller protected cryptocurrency exchange with manual review."
                points={["Bitcoin, Ethereum, USDT & more", "Buyer-Seller Verification", "Secure Manual Release"]}
                cta="Enter Crypto Escrow"
                highlight
              />
            </div>
          </div>
        </section>

        <section id="compliance" className="border-t border-border-soft bg-white py-12">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-3">
            <Feature icon={<UserCheck className="h-5 w-5 text-gold" />} title="KYC Verified" desc="Identity verification above $100" />
            <Feature icon={<ShieldCheck className="h-5 w-5 text-gold" />} title="Licensed &amp; Bonded" desc="Regulated escrow operator" />
            <Feature icon={<FileCheck2 className="h-5 w-5 text-gold" />} title="Audit Logged" desc="Every admin action recorded" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-navy/5">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

function HeroFeature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-sm text-white/60">{desc}</div>
      </div>
    </div>
  );
}

function PathCard({
  href,
  icon,
  title,
  desc,
  points,
  cta,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  points: string[];
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-8 transition-shadow ${
        highlight
          ? "border-navy bg-navy text-white shadow-[var(--shadow-card)]"
          : "border-border-soft bg-white shadow-[var(--shadow-card)]"
      }`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${highlight ? "bg-white/10" : "bg-gold-tint"}`}>
        {icon}
      </span>
      <h3 className={`mt-5 text-xl font-semibold ${highlight ? "text-white" : "text-navy"}`}>{title}</h3>
      <p className={`mt-2 text-sm ${highlight ? "text-white/70" : "text-gray-500"}`}>{desc}</p>
      <ul className={`mt-5 space-y-2 text-sm ${highlight ? "text-white/80" : "text-gray-600"}`}>
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${highlight ? "bg-gold" : "bg-navy"}`} />
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-lg text-sm font-medium ${
          highlight ? "bg-gold text-white hover:opacity-90" : "bg-navy text-white hover:bg-navy-light"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
