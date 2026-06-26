import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use the heavier "elevated" shadow (--shadow-card) seen in the reference designs instead of the default flat shadow-sm. */
  elevated?: boolean;
}

export function Card({ className, elevated, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-soft bg-white",
        elevated ? "shadow-[var(--shadow-card)]" : "shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border-soft px-5 py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-navy", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}
