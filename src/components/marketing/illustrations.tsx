import * as React from "react";

/**
 * Brand crest — a heraldic seal with a classical escrow/title-company building
 * motif (pediment + columns), rendered in the navy/gold palette. Pure SVG so it
 * scales crisply from the 36px header logo up to large hero usage.
 */
export function BrandCrest({
  className,
  variant = "navy",
}: {
  className?: string;
  variant?: "navy" | "light";
}) {
  const ring = variant === "light" ? "#ffffff" : "var(--navy)";
  const gold = "var(--gold)";
  const fill = variant === "light" ? "rgba(255,255,255,0.06)" : "#ffffff";
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill={fill} stroke={ring} strokeWidth="2" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={gold} strokeWidth="1" />
      {/* laurel dots around the ring */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={50 + Math.cos(a) * 44}
            cy={50 + Math.sin(a) * 44}
            r="0.8"
            fill={gold}
          />
        );
      })}
      {/* pediment */}
      <path d="M28 42 L50 30 L72 42 Z" fill={gold} />
      <rect x="30" y="42" width="40" height="3" fill={ring} />
      {/* columns */}
      <rect x="33" y="46" width="4" height="20" fill={ring} />
      <rect x="42" y="46" width="4" height="20" fill={ring} />
      <rect x="54" y="46" width="4" height="20" fill={ring} />
      <rect x="63" y="46" width="4" height="20" fill={ring} />
      {/* base */}
      <rect x="29" y="67" width="42" height="4" fill={gold} />
      {/* star */}
      <path
        d="M50 14 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 Z"
        fill={gold}
      />
    </svg>
  );
}

/**
 * Hero illustration — a framed "two services" composition: a residential
 * building and a coin/blockchain node joined by an escrow shield. Gold line-art
 * on a deep-navy panel, echoing the isometric reference art without bitmap assets.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 380" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroPanel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b1530" />
          <stop offset="0.6" stopColor="#060b1c" />
          <stop offset="1" stopColor="#131f45" />
        </linearGradient>
        <linearGradient id="goldFade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9a96a" />
          <stop offset="1" stopColor="#b08d57" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="480" height="380" rx="24" fill="url(#heroPanel)" />
      {/* faint grid */}
      <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="380" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 60} x2="480" y2={i * 60} />
        ))}
      </g>

      {/* House (real estate) */}
      <g transform="translate(70 150)">
        <path d="M0 60 L60 14 L120 60 Z" fill="none" stroke="url(#goldFade)" strokeWidth="2.5" />
        <rect x="14" y="60" width="92" height="86" fill="rgba(176,141,87,0.10)" stroke="url(#goldFade)" strokeWidth="2.5" />
        <rect x="48" y="100" width="24" height="46" fill="none" stroke="url(#goldFade)" strokeWidth="2" />
        <rect x="24" y="74" width="18" height="18" fill="none" stroke="url(#goldFade)" strokeWidth="1.5" />
        <rect x="78" y="74" width="18" height="18" fill="none" stroke="url(#goldFade)" strokeWidth="1.5" />
      </g>

      {/* Crypto node (right) */}
      <g transform="translate(300 150)">
        <circle cx="55" cy="55" r="52" fill="rgba(176,141,87,0.08)" stroke="url(#goldFade)" strokeWidth="2.5" />
        <text x="55" y="72" textAnchor="middle" fontSize="48" fontWeight="700" fill="url(#goldFade)" fontFamily="Georgia, serif">₿</text>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <circle key={i} cx={55 + Math.cos(a) * 52} cy={55 + Math.sin(a) * 52} r="4" fill="#c9a96a" />
          );
        })}
      </g>

      {/* Central escrow shield linking both */}
      <g transform="translate(195 30)">
        <path
          d="M45 6 L84 20 V58 C84 84 66 102 45 110 C24 102 6 84 6 58 V20 Z"
          fill="#0b1530"
          stroke="url(#goldFade)"
          strokeWidth="3"
        />
        <path d="M28 58 l12 12 22 -26" fill="none" stroke="#c9a96a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* connector lines */}
      <g stroke="rgba(201,169,106,0.4)" strokeWidth="1.5" strokeDasharray="4 5">
        <line x1="175" y1="210" x2="235" y2="150" />
        <line x1="305" y1="210" x2="245" y2="150" />
      </g>
    </svg>
  );
}

/**
 * A compact gradient "image header" for service cards — substitutes for a photo
 * banner with a large iconographic motif on a navy→gold wash.
 */
export function CardBanner({
  icon,
  tone = "navy",
}: {
  icon: React.ReactNode;
  tone?: "navy" | "gold";
}) {
  return (
    <div
      className="relative flex h-36 items-center justify-center overflow-hidden rounded-t-2xl"
      style={{
        backgroundImage:
          tone === "gold"
            ? "linear-gradient(135deg, #1b2a55 0%, #0b1530 55%, #b08d57 160%)"
            : "linear-gradient(135deg, #131f45 0%, #0b1530 60%, #060b1c 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(201,169,106,0.8), transparent 40%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-white/5 text-gold backdrop-blur-sm">
        {icon}
      </span>
    </div>
  );
}
