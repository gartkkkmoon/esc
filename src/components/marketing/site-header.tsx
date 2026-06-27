import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      {/* Trust strip */}
      <div className="bg-emerald-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-1.5 text-xs font-medium tracking-wide">
          <ShieldCheck className="h-3.5 w-3.5" />
          Trusted&nbsp;·&nbsp;Secure&nbsp;·&nbsp;Professional
        </div>
      </div>

      <div className="border-b border-border-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Broker Title & Escrow, LLC"
              width={391}
              height={130}
              priority
              className="h-11 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 lg:flex">
            <Link href="/real-estate-escrow" className="hover:text-navy">Real Estate</Link>
            <Link href="/crypto-escrow" className="hover:text-navy">Crypto Escrow</Link>
            <Link href="/real-estate-escrow#how-it-works" className="hover:text-navy">How It Works</Link>
            <Link href="/#compliance" className="hover:text-navy">Compliance</Link>
            <Link href="/#contact" className="hover:text-navy">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-navy">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Create Escrow
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
