import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client. Server-only — bypasses RLS.
 * Never import this from client components.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Resolve a user's roles via the service-role client (RLS-independent). */
export async function getUserRoles(userId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role as string);
}

/**
 * Bootstrap admin allowlist. Any email listed here (or in the ADMIN_EMAILS env
 * var, comma-separated) is always granted admin — independent of the database —
 * so the first admin can never be locked out by a misconfigured role row.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "admin@escrow.it")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Roles for a user, with the email allowlist applied. If an allowlisted user is
 * missing the admin role in the DB, it is written in (self-heal) so the rest of
 * the app stays consistent — but access never depends on that write succeeding.
 */
export async function getEffectiveRoles(userId: string, email?: string | null): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);

  if (isAdminEmail(email) && !roles.includes("admin")) {
    try {
      await admin.from("user_roles").upsert(
        { user_id: userId, role: "admin" },
        { onConflict: "user_id,role" }
      );
    } catch {
      // best-effort; access is still granted in-memory below
    }
    roles.push("admin");
  }
  return roles;
}
