"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Label, Textarea } from "@/components/ui/input";

export function AdminActionButton({
  label,
  modalTitle,
  action,
  variant = "outline",
  requireNote,
}: {
  label: string;
  modalTitle?: string;
  action: (formData: FormData) => void | Promise<void>;
  variant?: ButtonProps["variant"];
  requireNote?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant={variant} size="sm" className="w-full justify-start" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={modalTitle ?? label}>
        <form action={action} className="space-y-4">
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            This action is permanent, manual, and will be recorded in the audit log.
          </div>
          <div>
            <Label htmlFor={`reason-${label}`}>Reason (required)</Label>
            <Textarea id={`reason-${label}`} name="reason" rows={3} required placeholder="Explain why you are taking this action…" />
          </div>
          {requireNote !== false && (
            <div>
              <Label htmlFor={`note-${label}`}>Internal note (optional, staff only)</Label>
              <Textarea id={`note-${label}`} name="internal_note" rows={2} placeholder="Visible only to admin/compliance/mediator staff" />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant={variant === "danger" ? "danger" : "primary"}>
              Confirm &amp; {label}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
