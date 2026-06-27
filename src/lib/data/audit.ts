import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActionType, UserRole } from "@/lib/supabase/types";

export async function logAdminAction(params: {
  actorId: string;
  actorRole: UserRole;
  action: AdminActionType;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  reason: string;
}) {
  const supabase = createAdminClient();
  await supabase.from("audit_logs").insert({
    actor_id: params.actorId,
    actor_role: params.actorRole,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    old_value: params.oldValue ?? null,
    new_value: params.newValue ?? null,
    reason: params.reason,
  });
}

export async function addTimelineEvent(params: {
  contractId: string;
  actorId?: string | null;
  eventType: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  await supabase.from("contract_timeline_events").insert({
    contract_id: params.contractId,
    actor_id: params.actorId ?? null,
    event_type: params.eventType,
    description: params.description,
    metadata: params.metadata ?? {},
  });
}
