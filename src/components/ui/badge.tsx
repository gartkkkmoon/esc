import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "purple" | "navy";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-700",
  purple: "bg-purple-50 text-purple-700",
  navy: "bg-navy text-white",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, Tone> = {
  draft: "neutral",
  waiting_for_seller: "amber",
  seller_joined: "blue",
  seller_accepted: "blue",
  waiting_for_deposit: "amber",
  deposit_pending: "amber",
  blockchain_confirming: "amber",
  deposit_confirmed: "blue",
  admin_reviewing: "purple",
  active_escrow: "blue",
  awaiting_delivery: "blue",
  delivery_completed: "blue",
  release_requested: "purple",
  admin_reviewing_release: "purple",
  released: "green",
  completed: "green",
  cancelled: "neutral",
  refunded: "amber",
  disputed: "red",
  under_mediation: "red",
  resolved: "green",
  closed: "neutral",
  unpaid: "neutral",
  pending: "amber",
  paid: "green",
  failed: "red",
  not_required: "neutral",
  required: "amber",
  approved: "green",
  rejected: "red",
  needs_more_info: "amber",
  active: "green",
  disabled: "neutral",
  suspended: "red",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}
