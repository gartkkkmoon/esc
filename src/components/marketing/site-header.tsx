import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-sm font-bold text-gold">
            B
          </span>
          <span className="text-sm font-semibold tracking-tight text-navy">
            Broker&apos;s Title &amp; Escrow
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <Link href="/real-estate-escrow" className="hover:text-navy">Real Estate</Link>
          <Link href="/crypto-escrow" className="hover:text-navy">Crypto Escrow</Link>
          <Link href="/crypto-escrow#how-it-works" className="hover:text-navy">How It Works</Link>
          <Link href="/#compliance" className="hover:text-navy">Compliance</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-navy">
            Log in
          </Link>
          <Link
            href="/crypto-escrow"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light"
          >
            Create Escrow
          </Link>
        </div>
      </div>
    </header>
  );
}
