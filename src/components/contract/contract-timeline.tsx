import { formatDate } from "@/lib/utils";
import type { ContractStatus } from "@/lib/supabase/types";
import { Check } from "lucide-react";

export function ContractTimeline({
  events,
}: {
  events: { id: string; description: string; created_at: string }[];
}) {
  return (
    <ol className="space-y-4">
      {events.map((e, i) => (
        <li key={e.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-navy" />
            {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-border-soft" />}
          </div>
          <div className="pb-4">
            <p className="text-sm text-gray-800">{e.description}</p>
            <p className="text-xs text-gray-400">{formatDate(e.created_at)}</p>
          </div>
        </li>
      ))}
      {events.length === 0 && <p className="text-sm text-gray-400">No activity yet.</p>}
    </ol>
  );
}

// Ordered "happy path" steps used to derive the horizontal progress bar.
// Terminal/exception statuses (cancelled, disputed, refunded, etc.) are mapped
// to the nearest preceding step so the bar still renders sensibly.
const PROGRESS_STEPS: { key: string; label: string; statuses: ContractStatus[] }[] = [
  { key: "created", label: "Created", statuses: ["draft", "waiting_for_seller"] },
  { key: "accepted", label: "Seller Accepted", statuses: ["seller_joined", "seller_accepted"] },
  {
    key: "funded",
    label: "Funded",
    statuses: ["waiting_for_deposit", "deposit_pending", "blockchain_confirming", "deposit_confirmed"],
  },
  {
    key: "escrow",
    label: "In Escrow",
    statuses: ["admin_reviewing", "active_escrow", "awaiting_delivery", "delivery_completed"],
  },
  {
    key: "release",
    label: "Release Review",
    statuses: ["release_requested", "admin_reviewing_release", "disputed", "under_mediation", "resolved"],
  },
  { key: "closed", label: "Closed", statuses: ["released", "completed", "cancelled", "refunded", "closed"] },
];

function stepIndexForStatus(status: ContractStatus): number {
  const idx = PROGRESS_STEPS.findIndex((s) => s.statuses.includes(status));
  return idx === -1 ? 0 : idx;
}

export function ContractProgressBar({ status }: { status: ContractStatus }) {
  const activeIndex = stepIndexForStatus(status);
  const isException = ["disputed", "under_mediation", "cancelled", "refunded"].includes(status);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {PROGRESS_STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    isDone
                      ? "bg-navy text-white"
                      : isCurrent
                        ? isException
                          ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                          : "bg-gold text-white ring-2 ring-gold-tint"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`hidden text-center text-xs font-medium sm:block ${
                    isCurrent ? "text-navy" : isDone ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <span className={`mx-2 h-0.5 flex-1 ${isDone ? "bg-navy" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
