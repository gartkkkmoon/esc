import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "default" | "amber" | "red" | "green";

const toneClasses: Record<Tone, string> = {
  default: "bg-gold-tint text-navy",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  green: "bg-emerald-50 text-emerald-700",
};

const valueToneClasses: Record<Tone, string> = {
  default: "text-gray-900",
  amber: "text-amber-600",
  red: "text-red-600",
  green: "text-emerald-600",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-[var(--shadow-card)]", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className={cn("mt-1 text-2xl font-semibold", valueToneClasses[tone])}>{value}</div>
          {trend && <div className="mt-1 text-xs text-gray-400">{trend}</div>}
        </div>
        {icon && (
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
            {icon}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
