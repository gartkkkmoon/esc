"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  IdCard,
  CreditCard,
  Upload,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IdType = "drivers_license" | "passport" | "national_id";

const ID_TYPES: { value: IdType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "drivers_license",
    label: "Driver's License",
    icon: <IdCard className="h-6 w-6" />,
    description: "Government-issued driver's license, front and back.",
  },
  {
    value: "passport",
    label: "Passport",
    icon: <CreditCard className="h-6 w-6" />,
    description: "Photo page of a valid, unexpired passport.",
  },
  {
    value: "national_id",
    label: "National ID",
    icon: <FileText className="h-6 w-6" />,
    description: "Government-issued national identity card.",
  },
];

const STEPS = [
  { key: "id_type", label: "ID Type" },
  { key: "upload", label: "Upload Document" },
  { key: "quality", label: "Quality Check" },
  { key: "selfie", label: "Selfie" },
  { key: "review", label: "Review & Submit" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function FilePreview({ file }: { file: File | null }) {
  const url = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  React.useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!file || !url) return null;
  const isImage = file.type.startsWith("image/");

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border-soft">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="max-h-64 w-full object-contain bg-gray-50" />
      ) : (
        <div className="flex items-center gap-2 bg-gray-50 p-4 text-sm text-gray-600">
          <FileText className="h-5 w-5" />
          {file.name}
        </div>
      )}
    </div>
  );
}

export function KycWizard({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [step, setStep] = React.useState<StepKey>("id_type");
  const [idType, setIdType] = React.useState<IdType | null>(null);
  const [phone, setPhone] = React.useState("");
  const [idDocument, setIdDocument] = React.useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = React.useState<File | null>(null);
  const [selfie, setSelfie] = React.useState<File | null>(null);
  const [livenessCheck, setLivenessCheck] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const idDocInputRef = React.useRef<HTMLInputElement>(null);
  const passportInputRef = React.useRef<HTMLInputElement>(null);
  const proofInputRef = React.useRef<HTMLInputElement>(null);
  const selfieInputRef = React.useRef<HTMLInputElement>(null);
  const livenessInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function goTo(key: StepKey) {
    setStep(key);
  }

  function next() {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  }

  function back() {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  }

  const canProceedFromIdType = idType !== null && phone.trim().length >= 6;
  const canProceedFromUpload = idDocument !== null;
  const canProceedFromSelfie = selfie !== null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitting(true);
    // Let the native form submission proceed (calls the server action unchanged).
    // We just flip a local loading flag for UX; the page will redirect on success.
    void e;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stepper */}
        <ol className="mb-6 flex items-center">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={s.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      done
                        ? "bg-navy text-white"
                        : current
                          ? "bg-gold text-white ring-2 ring-gold-tint"
                          : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-center text-[11px] font-medium sm:block",
                      current ? "text-navy" : done ? "text-gray-700" : "text-gray-400"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={cn("mx-2 h-0.5 flex-1", done ? "bg-navy" : "bg-gray-200")} />
                )}
              </li>
            );
          })}
        </ol>

        {/* The single form that performs the real submission. All file inputs live here
            so the existing server action (which reads id_document/passport/proof_of_address/
            selfie/liveness_check from FormData) keeps working unchanged — we just reveal the
            relevant input to the user one step at a time. */}
        <form
          ref={formRef}
          action={action}
          encType="multipart/form-data"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Hidden inputs kept mounted across steps so their File values survive step changes. */}
          <input
            ref={idDocInputRef}
            type="file"
            name="id_document"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
          />
          <input ref={passportInputRef} type="file" name="passport" accept="image/*,.pdf" className="hidden" />
          {/* Phone carrier — kept mounted so its value is included on submit. */}
          <input type="hidden" name="phone" value={phone} />
          <input
            ref={proofInputRef}
            type="file"
            name="proof_of_address"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setProofOfAddress(e.target.files?.[0] ?? null)}
          />
          <input
            ref={selfieInputRef}
            type="file"
            name="selfie"
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
          />
          <input
            ref={livenessInputRef}
            type="file"
            name="liveness_check"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setLivenessCheck(e.target.files?.[0] ?? null)}
          />

          {step === "id_type" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone_visible">Phone number</Label>
                <Input
                  id="phone_visible"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                />
                <p className="mt-1 text-xs text-gray-400">Used by compliance to verify your identity.</p>
              </div>
              <p className="text-sm text-gray-600">Select the type of government-issued ID you&apos;ll upload.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {ID_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setIdType(t.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                      idType === t.value
                        ? "border-navy bg-gold-tint ring-1 ring-navy"
                        : "border-border-soft hover:bg-gray-50"
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-gold">
                      {t.icon}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{t.label}</span>
                    <span className="text-xs text-gray-500">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a clear photo or scan of your {ID_TYPES.find((t) => t.value === idType)?.label.toLowerCase()}.
              </p>
              <UploadDropzone
                label="Identity document"
                file={idDocument}
                onPick={() => idDocInputRef.current?.click()}
              />
              <FilePreview file={idDocument} />
              <div>
                <Label htmlFor="proof_of_address_visible">Proof of address (optional)</Label>
                <Input
                  id="proof_of_address_visible"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setProofOfAddress(f);
                    if (proofInputRef.current) {
                      const dt = new DataTransfer();
                      if (f) dt.items.add(f);
                      proofInputRef.current.files = dt.files;
                    }
                  }}
                />
              </div>
            </div>
          )}

          {step === "quality" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Confirm your document is legible before continuing.</p>
              <FilePreview file={idDocument} />
              <ul className="space-y-2 text-sm text-gray-600">
                <QualityCheck ok={!!idDocument} label="Document uploaded" />
                <QualityCheck ok={!!idDocument && idDocument.size > 0} label="File is not empty" />
                <QualityCheck ok={!!idDocument && idDocument.size < 15 * 1024 * 1024} label="File size under 15MB" />
              </ul>
              <p className="text-xs text-gray-400">
                If the image looks blurry or cropped, go back and re-upload before continuing.
              </p>
            </div>
          )}

          {step === "selfie" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Take or upload a clear selfie, then a short liveness video or photo.</p>
              <UploadDropzone
                label="Selfie"
                icon={<ScanFace className="h-6 w-6" />}
                file={selfie}
                onPick={() => selfieInputRef.current?.click()}
              />
              <FilePreview file={selfie} />
              <div>
                <Label htmlFor="liveness_visible">Liveness check / short video (optional)</Label>
                <Input
                  id="liveness_visible"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setLivenessCheck(f);
                    if (livenessInputRef.current) {
                      const dt = new DataTransfer();
                      if (f) dt.items.add(f);
                      livenessInputRef.current.files = dt.files;
                    }
                  }}
                />
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Review your submission before sending it for manual compliance review.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ReviewRow label="Phone number" value={phone || "Not provided"} ok={phone.trim().length >= 6} />
                <ReviewRow label="ID type" value={ID_TYPES.find((t) => t.value === idType)?.label ?? "—"} />
                <ReviewRow label="Identity document" value={idDocument?.name ?? "Not uploaded"} ok={!!idDocument} />
                <ReviewRow label="Proof of address" value={proofOfAddress?.name ?? "Skipped"} />
                <ReviewRow label="Selfie" value={selfie?.name ?? "Not uploaded"} ok={!!selfie} />
                <ReviewRow label="Liveness check" value={livenessCheck?.name ?? "Skipped"} />
              </div>
              <div className="flex gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
                <p>
                  Files are uploaded to a private, access-controlled storage bucket and are only viewable by you
                  and compliance staff. All submissions are reviewed manually.
                </p>
              </div>
            </div>
          )}

          {/* Step navigation */}
          <div className="flex items-center justify-between border-t border-border-soft pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={stepIndex === 0}
              className={stepIndex === 0 ? "invisible" : ""}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            {step !== "review" ? (
              <Button
                type="button"
                onClick={next}
                disabled={
                  (step === "id_type" && !canProceedFromIdType) ||
                  (step === "upload" && !canProceedFromUpload) ||
                  (step === "selfie" && !canProceedFromSelfie)
                }
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={submitting || !idDocument || !selfie}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Submit for Manual Review"
                )}
              </Button>
            )}
          </div>
        </form>

        {/* Quick jump back to an earlier step, shown once past the first step */}
        {stepIndex > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
            {STEPS.slice(0, stepIndex).map((s) => (
              <button key={s.key} type="button" onClick={() => goTo(s.key)} className="underline hover:text-navy">
                Edit {s.label.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UploadDropzone({
  label,
  file,
  onPick,
  icon,
}: {
  label: string;
  file: File | null;
  onPick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
        file ? "border-navy bg-gold-tint" : "border-border-soft hover:bg-gray-50"
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
        {icon ?? <Upload className="h-5 w-5" />}
      </span>
      <span className="text-sm font-medium text-gray-900">{file ? file.name : `Upload ${label.toLowerCase()}`}</span>
      <span className="text-xs text-gray-400">{file ? "Tap to replace" : "Click to choose a file"}</span>
    </button>
  );
}

function QualityCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className={cn("h-4 w-4", ok ? "text-emerald-600" : "text-gray-300")} />
      <span className={ok ? "text-gray-700" : "text-gray-400"}>{label}</span>
    </li>
  );
}

function ReviewRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-lg border border-border-soft p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={cn("mt-0.5 text-sm font-medium", ok === false ? "text-red-600" : "text-gray-800")}>{value}</div>
    </div>
  );
}
