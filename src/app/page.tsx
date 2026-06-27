import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  ShieldCheck,
  Building2,
  Bitcoin,
  Scale,
  UserCheck,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Wallet2,
  FileCheck2,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero — full-bleed corporate */}
        <section className="relative overflow-hidden bg-navy-900">
          <Image
            src="/images/card-realestate.jpg"
            alt="Residential property closing"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 border-l-2 border-gold pl-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                <ShieldCheck className="h-3.5 w-3.5" /> Licensed · Bonded · Insured
              </span>
              <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                Two Escrow Services.
                <br />
                One Standard of Trust.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                Broker&apos;s Title &amp; Escrow, LLC safeguards high-value real estate closings and
                cryptocurrency transactions with <span className="font-semibold text-white">bank-grade,
                end-to-end encryption</span> and human oversight — every dollar verified and released
                by hand, never automated.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/real-estate-escrow"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gold px-6 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
                >
                  <Building2 className="h-4 w-4" /> Real Estate Escrow
                </Link>
                <Link
                  href="/crypto-escrow"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Bitcoin className="h-4 w-4" /> Crypto Escrow
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-gold" /> AES-256 encrypted</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-gold" /> Cold-storage custody</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-gold" /> KYC / AML verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-y border-border-soft bg-background">
          <div className="mx-auto grid max-w-7xl gap-px overflow-hidden px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureStripItem icon={<Lock className="h-5 w-5" />} title="Bank-Grade Encryption" desc="AES-256 & 256-bit SSL, end-to-end" />
            <FeatureStripItem icon={<ShieldCheck className="h-5 w-5" />} title="Manual Oversight" desc="Every release reviewed by staff" />
            <FeatureStripItem icon={<UserCheck className="h-5 w-5" />} title="KYC / AML Verified" desc="Identity verification & screening" />
            <FeatureStripItem icon={<Scale className="h-5 w-5" />} title="Dispute Mediation" desc="Impartial resolution support" />
          </div>
        </section>

        {/* Service cards */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold text-navy">Choose Your Escrow Service</h2>
              <p className="mt-3 text-gray-600">
                Purpose-built workflows for two very different transactions, held to the same
                standard of manual, professional oversight.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <ServiceCard
                href="/real-estate-escrow"
                banner={<PhotoBanner src="/images/realestate-hero.jpg" alt="Residential real estate closing" />}
                title="Real Estate Escrow"
                desc="Secure closings for residential and commercial property transactions."
                points={[
                  "Residential & commercial closings",
                  "Title insurance coordination",
                  "Earnest money & settlement holds",
                  "Experienced escrow officers",
                ]}
                cta="Enter Real Estate Escrow"
                ctaTone="navy"
              />
              <ServiceCard
                href="/crypto-escrow"
                banner={<PhotoBanner src="/images/card-crypto.jpg" alt="Cryptocurrency escrow" />}
                title="Crypto Escrow"
                desc="Buyer-and-seller protected cryptocurrency exchange with manual review."
                points={[
                  "Bitcoin, Ethereum, USDT & more",
                  "Buyer–seller identity verification",
                  "On-chain deposit confirmation",
                  "Secure, manual fund release",
                ]}
                cta="Enter Crypto Escrow"
                ctaTone="gold"
              />
            </div>
          </div>
        </section>

        {/* Security & compliance */}
        <section id="compliance" className="border-t border-border-soft bg-background py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Security First</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-navy">
                Your funds and data, protected end to end
              </h2>
              <p className="mt-3 text-gray-600">
                We hold ourselves to institutional security standards so you can transact with confidence —
                whether it&apos;s a property closing or a seven-figure crypto deal.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Compliance icon={<Lock className="h-5 w-5 text-gold" />} title="Bank-Grade Encryption" desc="AES-256 encryption at rest and 256-bit SSL/TLS in transit — your data is end-to-end encrypted." />
              <Compliance icon={<Wallet2 className="h-5 w-5 text-gold" />} title="Cold-Storage Custody" desc="Escrowed crypto is held in offline, multi-signature cold wallets — never exposed to the open internet." />
              <Compliance icon={<ShieldCheck className="h-5 w-5 text-gold" />} title="Licensed & Bonded" desc="A regulated, bonded escrow provider operating under formal compliance controls." />
              <Compliance icon={<UserCheck className="h-5 w-5 text-gold" />} title="KYC / AML Verified" desc="Identity verification and sanctions screening on every counterparty above threshold." />
              <Compliance icon={<FileCheck2 className="h-5 w-5 text-gold" />} title="Full Audit Trail" desc="Every release, approval, and admin action is permanently logged and reviewable." />
              <Compliance icon={<Lock className="h-5 w-5 text-gold" />} title="Manual Release Control" desc="No funds move automatically. Each release is verified and authorized by a human officer." />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-navy-900 py-16 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold">Speak with an escrow officer</h2>
              <p className="mt-3 max-w-md text-white/70">
                Have a transaction in progress or a question about getting started? Our team
                reviews every escrow personally.
              </p>
              <div className="mt-8 space-y-4 text-sm">
                <ContactRow icon={<Phone className="h-4 w-4 text-gold" />} text="(800) 555-0134" />
                <ContactRow icon={<Mail className="h-4 w-4 text-gold" />} text="support@brokerstitleescrow.com" />
                <ContactRow icon={<MapPin className="h-4 w-4 text-gold" />} text="2025 Main Street, Suite 5, Phoenix, AZ 85004" />
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="font-serif text-xl font-semibold">Ready to open an escrow?</h3>
              <p className="mt-2 text-sm text-white/70">
                Create your account and start a real estate or crypto escrow in minutes.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Create Escrow <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function PhotoBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-44 w-full overflow-hidden">
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />
    </div>
  );
}

function FeatureStripItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 px-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-navy">{title}</div>
        <div className="text-sm text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

function ServiceCard({
  href,
  banner,
  title,
  desc,
  points,
  cta,
  ctaTone,
}: {
  href: string;
  banner: React.ReactNode;
  title: string;
  desc: string;
  points: string[];
  cta: string;
  ctaTone: "navy" | "gold";
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border-soft bg-white shadow-[var(--shadow-card)]">
      {banner}
      <div className="flex flex-1 flex-col border-t-2 border-gold p-8">
        <h3 className="font-serif text-2xl font-bold text-navy">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{desc}</p>
        <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
              {p}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
            ctaTone === "gold" ? "bg-gold" : "bg-navy"
          }`}
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Compliance({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-gold-tint">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-navy">{title}</div>
        <div className="text-sm text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

function ContactRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">{icon}</span>
      {text}
    </div>
  );
}
