export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-navy text-white/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="text-sm font-semibold text-white">Broker&apos;s Title &amp; Escrow, LLC</div>
          <p className="mt-2 text-sm">
            Licensed title, closing, and escrow services. Secure escrow for real estate and digital assets.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-white">Contact</div>
          <p className="mt-2">support@brokerstitleescrow.com</p>
          <p>(800) 555-0134</p>
          <p>2025 Main Street, Suite 5, Phoenix, AZ</p>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-white">Trust &amp; Compliance</div>
          <p className="mt-2">Licensed &amp; Bonded · KYC/AML Compliant · SOC 2-aligned controls</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs">
        © {new Date().getFullYear()} Broker&apos;s Title &amp; Escrow, LLC. All rights reserved.
      </div>
    </footer>
  );
}
