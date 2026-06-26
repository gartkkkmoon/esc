import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminActionButton } from "@/components/admin/action-button";
import { performContractActionAction } from "@/lib/data/admin-actions";
import type { AdminActionType } from "@/lib/supabase/types";

const GROUPS: { title: string; actions: { action: AdminActionType; label: string; variant?: "outline" | "success" | "danger" }[] }[] = [
  {
    title: "Status",
    actions: [
      { action: "mark_deposit_confirmed", label: "Mark Deposit Confirmed" },
      { action: "mark_pending", label: "Mark Pending" },
      { action: "mark_payment_failed", label: "Mark Payment Failed", variant: "danger" },
      { action: "mark_paid", label: "Mark Paid" },
      { action: "mark_unpaid", label: "Mark Unpaid" },
      { action: "mark_complete", label: "Mark Complete", variant: "success" },
      { action: "mark_incomplete", label: "Mark Incomplete" },
    ],
  },
  {
    title: "Funds",
    actions: [
      { action: "release_funds", label: "Release Funds", variant: "success" },
      { action: "refund_funds", label: "Refund Funds", variant: "danger" },
    ],
  },
  {
    title: "Contract Controls",
    actions: [
      { action: "pause_contract", label: "Pause Contract" },
      { action: "cancel_contract", label: "Cancel Contract", variant: "danger" },
      { action: "lock_contract", label: "Lock Contract" },
      { action: "unlock_contract", label: "Unlock Contract" },
    ],
  },
];

export function ManualActionsPanel({ contractId }: { contractId: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>Manual Actions</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.title}</div>
            <div className="grid grid-cols-2 gap-2">
              {group.actions.map((a) => (
                <AdminActionButton
                  key={a.action}
                  label={a.label}
                  variant={a.variant}
                  action={performContractActionAction.bind(null, contractId, a.action)}
                />
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400">
          Every action above requires a reason and is permanently recorded in the audit log.
        </p>
      </CardContent>
    </Card>
  );
}
