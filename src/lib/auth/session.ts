import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/supabase/admin";
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

  // Roles are resolved with the service-role client so admin detection never
  // depends on RLS policies on user_roles being perfectly configured.
  const roles = (await getUserRoles(data.user.id)) as UserRole[];

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
