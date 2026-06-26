import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-sm font-bold text-gold">
            B
          </span>
          <span className="text-sm font-semibold tracking-tight text-navy">
            Broker&apos;s Title &amp; Escrow
          </span>
        </Link>
        <div className="rounded-2xl border border-border-soft bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
