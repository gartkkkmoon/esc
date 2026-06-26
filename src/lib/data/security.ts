"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export async function toggleTwoFactorAction(formData: FormData) {
  const { authId } = await requireUser();
  const supabase = await createClient();
  const enabled = String(formData.get("enabled") ?? "") === "true";

  await supabase.from("profiles").update({ two_factor_enabled: enabled }).eq("id", authId);
  redirect("/dashboard/security");
}
