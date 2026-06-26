import { formatDate } from "@/lib/utils";

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
