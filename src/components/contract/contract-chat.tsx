import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, initials } from "@/lib/utils";
import { sendMessageAction } from "@/lib/data/contracts";
import type { ContractMessage, MessageType } from "@/lib/supabase/types";

const ROLE_TONE: Record<MessageType, "blue" | "green" | "navy" | "purple" | "amber" | "neutral"> = {
  buyer: "blue",
  seller: "green",
  admin: "navy",
  mediator: "purple",
  compliance: "amber",
  system: "neutral",
};

type SendableMessageType = "buyer" | "seller" | "admin" | "mediator" | "compliance";

export function ContractChat({
  contractId,
  messages,
  senderType,
  names,
}: {
  contractId: string;
  messages: ContractMessage[];
  senderType: SendableMessageType | null;
  names: Record<string, string>;
}) {
  return (
    <div className="flex h-[480px] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {initials(names[m.sender_id ?? ""] ?? m.message_type)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {names[m.sender_id ?? ""] ?? m.message_type}
                </span>
                <Badge tone={ROLE_TONE[m.message_type]}>{m.message_type}</Badge>
                {m.is_official && <Badge tone="navy">Official</Badge>}
                <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{m.body}</p>
            </div>
          </div>
        ))}
      </div>
      {senderType && (
        <form
          action={async (formData) => {
            "use server";
            await sendMessageAction(contractId, senderType, formData);
          }}
          className="flex items-end gap-2 border-t border-border-soft p-4"
        >
          <Textarea name="body" rows={2} placeholder="Write a message…" required className="flex-1" />
          <Button type="submit" size="sm">Send</Button>
        </form>
      )}
    </div>
  );
}
