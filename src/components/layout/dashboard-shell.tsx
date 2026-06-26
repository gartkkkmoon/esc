import * as React from "react";
import Link from "next/link";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BrandCrest } from "@/components/marketing/illustrations";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export function DashboardShell({
  navItems,
  brand,
  userSlot,
  children,
}: {
  navItems: NavItem[];
  brand: string;
  userSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col bg-navy-900 text-white md:flex">
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <BrandCrest className="h-9 w-9" variant="light" />
          <span className="font-serif text-base font-bold leading-tight tracking-tight">
            {brand}
          </span>
        </Link>
        <SidebarNav navItems={navItems} />
        {userSlot && <div className="border-t border-white/10 px-4 py-4">{userSlot}</div>}
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-soft bg-white px-6 py-5">
      <div>
        <h1 className="font-serif text-2xl font-bold text-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
