import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Building2, FileCheck2, ShieldCheck } from "lucide-react";

export default function RealEstateEscrowPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border-soft bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">Real Estate Escrow</p>
            <h1 className="mt-4 text-3xl font-semibold text-navy md:text-4xl">
              Decades of Title &amp; Closing Experience
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Broker&apos;s Title &amp; Escrow, LLC has handled residential and commercial closings,
              title insurance, and escrow disbursement for years. This online platform focuses on
              crypto escrow — for a real estate transaction, our team works with you directly.
            </p>
          </div>
        </section>

        <section className="bg-background py-14">
          <div className="mx-auto grid max-w-5xl gap-6 px-6 sm:grid-cols-3">
            <InfoCard icon={<Building2 className="h-5 w-5 text-navy" />} title="Residential & Commercial" desc="Purchase, sale, and refinance closings handled by licensed escrow officers." />
            <InfoCard icon={<ShieldCheck className="h-5 w-5 text-navy" />} title="Title Insurance" desc="Owner's and lender's title policies issued through trusted underwriters." />
            <InfoCard icon={<FileCheck2 className="h-5 w-5 text-navy" />} title="Escrow Disbursement" desc="Funds held and disbursed according to signed closing instructions." />
          </div>
          <div className="mx-auto mt-12 max-w-5xl rounded-2xl border border-border-soft bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-navy">Start a Real Estate Escrow Request</h2>
            <p className="mt-2 text-sm text-gray-500">
              Contact our team to open a file for your residential or commercial closing.
            </p>
            <a
              href="mailto:closings@brokerstitleescrow.com"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-navy px-6 text-sm font-medium text-white hover:bg-navy-light"
            >
              Contact Our Escrow Team
            </a>
          </div>
          <div className="mx-auto mt-8 max-w-5xl text-center">
            <Link href="/crypto-escrow" className="text-sm font-medium text-navy underline">
              Looking for crypto escrow instead?
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-white p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">{icon}</span>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
