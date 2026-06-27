import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Building2, FileCheck2, ShieldCheck, Landmark, FileSignature, KeySquare, Handshake } from "lucide-react";

export default function RealEstateEscrowPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border-soft">
          <Image
            src="/images/realestate-hero.jpg"
            alt="Luxury modern home at sunset"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/10" />
          <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">Real Estate Escrow</p>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
                Real Estate Closings
                <br className="hidden sm:block" /> Made Secure and Simple
              </h1>
              <p className="mt-5 max-w-lg text-lg text-white/80">
                Broker&apos;s Title &amp; Escrow, LLC provides professional title, escrow, and closing
                services for residential and commercial property transactions — every file secured
                with bank-grade encryption and handled by a dedicated escrow officer.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-6 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
                >
                  Start a Closing
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Contact Escrow Officer
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={<Building2 className="h-5 w-5 text-navy" />} title="Residential & Commercial" desc="Purchase, sale, and refinance closings handled by licensed escrow officers." />
            <InfoCard icon={<ShieldCheck className="h-5 w-5 text-navy" />} title="Title Insurance" desc="Owner's and lender's title policies issued through trusted underwriters." />
            <InfoCard icon={<FileCheck2 className="h-5 w-5 text-navy" />} title="Escrow Disbursement" desc="Funds held and disbursed according to signed closing instructions." />
            <InfoCard icon={<Landmark className="h-5 w-5 text-navy" />} title="Lender Coordination" desc="We work directly with lenders to keep funding and closing on schedule." />
          </div>
        </section>

        <section className="border-t border-border-soft bg-white py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center font-serif text-3xl font-bold text-navy">How It Works</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <ProcessStep n={1} icon={<FileSignature className="h-5 w-5 text-gold" />} title="Open Your File" desc="Contact our team with your purchase agreement or closing instructions." />
              <ProcessStep n={2} icon={<Handshake className="h-5 w-5 text-gold" />} title="Title &amp; Escrow Review" desc="We order title, coordinate with lenders, and prepare closing documents." />
              <ProcessStep n={3} icon={<KeySquare className="h-5 w-5 text-gold" />} title="Closing &amp; Disbursement" desc="Funds are disbursed per signed instructions and the deal closes." />
            </div>
          </div>
        </section>

        <section className="border-t border-border-soft bg-navy-900 py-16 text-white">
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10">
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">Start a Real Estate Escrow Request</h2>
                  <p className="mt-2 text-sm text-white/60">
                    Contact our team to open a file for your residential or commercial closing.
                    We&apos;ll respond within one business day.
                  </p>
                  <div className="mt-6 space-y-1 text-sm text-white/70">
                    <p>support@brokerstitleescrow.com</p>
                    <p>(800) 555-0134</p>
                    <p>2025 Main Street, Suite 5, Phoenix, AZ</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row md:flex-col">
                  <a
                    href="mailto:closings@brokerstitleescrow.com"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-white hover:opacity-90"
                  >
                    Contact Our Escrow Team
                  </a>
                  <Link
                    href="/crypto-escrow"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Looking for crypto escrow instead?
                  </Link>
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

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-white p-6 shadow-[var(--shadow-card)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-tint">{icon}</span>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function ProcessStep({ n, icon, title, desc }: { n: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="relative rounded-xl border border-border-soft bg-background p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
          {n}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-tint">{icon}</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
