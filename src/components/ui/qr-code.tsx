import QRCode from "qrcode";

/**
 * Async server component that renders a QR code for any string (e.g. a crypto
 * deposit address) as an inline data-URL image. Generated on the server — no
 * third-party QR service, works offline.
 */
export async function QrCode({
  value,
  size = 150,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const dataUrl = await QRCode.toDataURL(value, { margin: 1, width: size });
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Deposit address QR code"
      width={size}
      height={size}
      className={className ?? "rounded-lg border border-border-soft bg-white p-2"}
    />
  );
}
