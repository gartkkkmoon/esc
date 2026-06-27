import Link from "next/link";
import Image from "next/image";

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
        <Link href="/" className="mb-8 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Broker Title & Escrow, LLC"
            width={391}
            height={130}
            priority
            className="h-12 w-auto"
          />
        </Link>
        <div className="rounded-2xl border border-border-soft bg-white p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
