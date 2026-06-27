import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { LayoutDashboard, FilePlus2, FileStack, UserCircle2, ShieldCheck, LayoutPanelLeft, Wallet } from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Wallet", href: "/dashboard/wallet", icon: <Wallet className="h-4 w-4" /> },
  { label: "New Contract", href: "/dashboard/contracts/new", icon: <FilePlus2 className="h-4 w-4" /> },
  { label: "My Contracts", href: "/dashboard/contracts", icon: <FileStack className="h-4 w-4" /> },
  { label: "KYC", href: "/dashboard/kyc", icon: <UserCircle2 className="h-4 w-4" /> },
  { label: "Security", href: "/dashboard/security", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, roles } = await requireUser();

  // Admins land on /admin at login, but if one is browsing the client portal,
  // surface a direct link back into the admin portal.
  const items = roles.includes("admin")
    ? [...navItems, { label: "Admin Portal", href: "/admin", icon: <LayoutPanelLeft className="h-4 w-4" /> }]
    : navItems;

  return (
    <DashboardShell
      brand="Client Portal"
      navItems={items}
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
