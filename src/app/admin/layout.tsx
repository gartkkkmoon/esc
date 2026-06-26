import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { requireAdmin } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import {
  LayoutDashboard, FileStack, Users, ShieldCheck, Wallet, Gavel, ScrollText, Settings,
} from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Contracts", href: "/admin/contracts", icon: <FileStack className="h-4 w-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "KYC Queue", href: "/admin/kyc", icon: <ShieldCheck className="h-4 w-4" /> },
  { label: "Wallets", href: "/admin/wallets", icon: <Wallet className="h-4 w-4" /> },
  { label: "Disputes", href: "/admin/disputes", icon: <Gavel className="h-4 w-4" /> },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: <ScrollText className="h-4 w-4" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <DashboardShell
      brand="Admin · Broker's Escrow"
      navItems={navItems}
      userSlot={
        <form action={signOutAction} className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-white/80">{profile?.full_name || profile?.email}</span>
          <button className="text-xs text-white/60 hover:text-white">Log out</button>
        </form>
      }
    >
      {children}
    </DashboardShell>
  );
}
