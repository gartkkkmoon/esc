import * as React from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

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
      <aside className="hidden w-64 flex-col bg-navy text-white md:flex">
        <div className="px-6 py-6 text-lg font-semibold tracking-tight border-b border-white/10">
          {brand}
        </div>
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
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
