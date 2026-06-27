import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveRoles } from "@/lib/supabase/admin";
import type { Profile, UserRole } from "@/lib/supabase/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  // Roles are resolved with the service-role client (RLS-independent) plus the
  // admin email allowlist, so admin detection can't be blocked by RLS or a
  // missing role row.
  const roles = (await getEffectiveRoles(data.user.id, data.user.email)) as UserRole[];

  return { authId: data.user.id, profile: profile as Profile | null, roles };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.roles.includes("admin")) redirect("/dashboard");
  return user;
}
