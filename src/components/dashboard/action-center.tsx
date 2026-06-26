import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface ActionCenterItem {
  label: string;
  count: number;
  href: string;
}

export function ActionCenter({
  title = "Market Action Center",
  items,
}: {
  title?: string;
  items: ActionCenterItem[];
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 hover:bg-gray-100"
          >
            <span className="text-gray-700">{item.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                item.count > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-500"
              }`}
            >
              {item.count}
            </span>
          </Link>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">Nothing needs attention right now.</p>}
      </CardContent>
    </Card>
  );
}
