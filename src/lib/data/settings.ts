"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/data/audit";

export async function updateSettingAction(key: string, formData: FormData) {
  const { authId } = await requireAdmin();
  const supabase = await createClient();
  const value = String(formData.get("value") ?? "");

  let parsed: unknown = value;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = value;
  }

  const { data: before } = await supabase.from("platform_settings").select("*").eq("key", key).single();

  await supabase
    .from("platform_settings")
    .upsert({ key, value: parsed, updated_by: authId, updated_at: new Date().toISOString() });

  await logAdminAction({
    actorId: authId,
    actorRole: "admin",
    action: "edit_contract",
    entityType: "platform_settings",
    entityId: null,
    oldValue: before ?? null,
    newValue: { key, value: parsed },
    reason: `Updated platform setting "${key}"`,
  });

  redirect("/admin/settings");
}
