"use client";

import { forwardRef, type ReactNode } from "react";

export type WrappedCardVariant =
  | "cover"
  | "total"
  | "category"
  | "store"
  | "big"
  | "cashback"
  | "day"
  | "finale";

const PALETTES: Record<
  WrappedCardVariant,
  {
    bg: string;
    fg: string;
    accent: string;
    soft: string;
    ink: string;
  }
> = {
  cover: {
    bg: "#1A1815",
    fg: "#FBF7EE",
    accent: "#B83A26",
    soft: "#E8A85C",
    ink: "#1A1815",
  },
  total: {
    bg: "linear-gradient(180deg, #F0D5A8 0%, #E8A85C 100%)",
    fg: "#1A1815",
    accent: "#1A1815",
    soft: "#B83A26",
    ink: "#1A1815",
  },
  category: {
    bg: "#F4EFE0",
    fg: "#1A1815",
    accent: "#B83A26",
    soft: "#D9D1C0",
    ink: "#1A1815",
  },
  store: {
    bg: "#7C4A3A",
    fg: "#FBF7EE",
    accent: "#E8A85C",
    soft: "rgba(251, 247, 238, 0.2)",
    ink: "#1A1815",
  },
  big: {
    bg: "#B83A26",
    fg: "#FBF7EE",
    accent: "#1A1815",
    soft: "rgba(251, 247, 238, 0.25)",
    ink: "#1A1815",
  },
  cashback: {
    bg: "#1A1815",
    fg: "#FBF7EE",
    accent: "#E8A85C",
    soft: "rgba(251, 247, 238, 0.18)",
    ink: "#1A1815",
  },
  day: {
    bg: "#1A3A4A",
    fg: "#F4EFE0",
    accent: "#E8A85C",
    soft: "rgba(232, 168, 92, 0.22)",
    ink: "#1A1815",
  },
  finale: {
    bg: "#B83A26",
    fg: "#FBF7EE",
    accent: "#E8A85C",
    soft: "rgba(251, 247, 238, 0.18)",
    ink: "#1A1815",
  },
};

interface WrappedCardProps {
  tripName: string;
  year: string;
  title: string;
  kicker?: string;
  big: string;
  sub: string;
  note?: string;
  badge?: string;
  decorText?: string;
  variant: WrappedCardVariant;
  index: number;
  total: number;
  iconSrc: string;
}

function DecorativeLayer({
  variant,
  accent,
  soft,
  decorText,
}: {
  variant: WrappedCardVariant;
  accent: string;
  soft: string;
  decorText?: string;
}) {
  if (variant === "cover") {
    return (
      <>
        <div style={{ position: "absolute", right: -42, top: 118, width: 250, height: 250, borderRadius: "50%", background: accent, opacity: 0.95 }} />
        <div style={{ position: "absolute", left: -36, bottom: 70, width: 150, height: 150, borderRadius: "50%", background: soft }} />
      </>
    );
  }

  if (variant === "category") {
    return (
      <div style={{ position: "absolute", right: -8, top: 118, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 260, fontWeight: 900, lineHeight: 1, color: accent, opacity: 0.08 }}>
        {decorText ?? "旅"}
      </div>
    );
  }

  if (variant === "big") {
    return (
      <div style={{ position: "absolute", left: -24, right: -24, top: 282, height: 112, background: "#1A1815", transform: "rotate(-6deg)" }} />
    );
  }

  if (variant === "cashback") {
    return (
      <div style={{ position: "absolute", right: -88, top: 168, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 210, fontWeight: 800, lineHeight: 1, color: accent, opacity: 0.09 }}>
        $
      </div>
    );
  }

  if (variant === "day") {
    return (
      <>
        <div style={{ position: "absolute", left: -38, top: -38, width: 190, height: 190, borderRadius: "50%", background: accent, opacity: 0.86 }} />
        <div style={{ position: "absolute", right: -54, bottom: 138, width: 152, height: 152, borderRadius: "50%", border: `2px solid ${accent}`, opacity: 0.58 }} />
      </>
    );
  }

  return (
    <>
      <div style={{ position: "absolute", top: -56, right: -48, width: 214, height: 214, borderRadius: "50%", border: `2px dashed ${soft}` }} />
      <div style={{ position: "absolute", bottom: -76, left: -52, width: 180, height: 180, borderRadius: "50%", background: soft }} />
    </>
  );
}

function BrandMark({ iconSrc, fg }: { iconSrc: string; fg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" width={22} height={22} crossOrigin="anonymous" style={{ display: "block" }} />
      </div>
      <span style={{ color: fg, opacity: 0.72 }}>旅帳</span>
    </div>
  );
}

function MetaText({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 10, letterSpacing: "0.24em", color, opacity: 0.76 }}>
      {children}
    </div>
  );
}

export const WrappedCard = forwardRef<HTMLDivElement, WrappedCardProps>(
  function WrappedCard(
    {
      tripName,
      year,
      title,
      kicker,
      big,
      sub,
      note,
      badge,
      decorText,
      variant,
      index,
      total,
      iconSrc,
    },
    ref
  ) {
    const palette = PALETTES[variant];
    const isCover = variant === "cover";
    const isFinale = variant === "finale";

    return (
      <div
        ref={ref}
        style={{
          width: 340,
          minHeight: 560,
          borderRadius: 30,
          padding: 28,
          background: palette.bg,
          color: palette.fg,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.22)",
        }}
      >
        <DecorativeLayer
          variant={variant}
          accent={palette.accent}
          soft={palette.soft}
          decorText={decorText}
        />

        <div data-export-hide="true" style={{ position: "absolute", top: 22, left: 18, right: 18, display: "flex", gap: 3, zIndex: 3 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: i <= index ? palette.fg : `${palette.fg}40`,
              }}
            />
          ))}
        </div>

        <div data-export-hide="true" style={{ position: "absolute", top: 38, left: 26, right: 26, zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            <MetaText color={palette.fg}>
              RECAP · {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </MetaText>
          </span>
          <MetaText color={palette.fg}>{year}</MetaText>
        </div>

        <div style={{ position: "relative", zIndex: 2, minHeight: 504, display: "flex", flexDirection: "column", paddingTop: 58 }}>
          {isCover ? (
            <>
              <MetaText color={palette.soft}>TRAVEL RECAP · {year}</MetaText>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 29, fontWeight: 600, lineHeight: 1, opacity: 0.86 }}>你的</div>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 88, fontWeight: 900, letterSpacing: "-0.08em", lineHeight: 0.9, marginTop: 8 }}>{tripName}</div>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 70, fontWeight: 900, letterSpacing: "-0.08em", lineHeight: 0.95 }}>之旅</div>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: palette.accent, marginTop: 16 }} />
              </div>
              <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, lineHeight: 1.6, opacity: 0.74 }}>{sub}</div>
            </>
          ) : (
            <>
              <div>
                <MetaText color={variant === "total" ? palette.accent : palette.accent}>
                  {kicker ?? title.toUpperCase()}
                </MetaText>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: isFinale ? 44 : 24, fontWeight: isFinale ? 900 : 600, lineHeight: isFinale ? 0.98 : 1.15, letterSpacing: isFinale ? "-0.06em" : "-0.02em", marginTop: 8 }}>
                  {title}
                </div>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: variant === "store" ? 58 : variant === "category" ? 74 : variant === "day" ? 68 : isFinale ? 55 : 70,
                    fontWeight: 900,
                    letterSpacing: "-0.075em",
                    lineHeight: 0.9,
                    color: ["category", "cashback", "day"].includes(variant) ? palette.accent : palette.fg,
                    wordBreak: "break-word",
                  }}
                >
                  {big}
                </div>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, fontWeight: 600, lineHeight: 1.35, opacity: 0.82, marginTop: 14 }}>
                  {sub}
                </div>
                {note && (
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px ${variant === "cashback" ? "dashed" : "solid"} ${palette.soft}`, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13, lineHeight: 1.65, opacity: 0.78 }}>
                    {note}
                  </div>
                )}
              </div>

              {badge && (
                <div style={{ alignSelf: "flex-start", transform: "rotate(-2deg)", padding: "7px 13px", background: palette.fg, color: variant === "total" ? "#E8A85C" : palette.bg === "#B83A26" ? "#B83A26" : palette.ink, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.18em" }}>
                  {badge}
                </div>
              )}
            </>
          )}

          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 9,
              letterSpacing: "0.16em",
              opacity: 0.62,
            }}
          >
            <BrandMark iconSrc={iconSrc} fg={palette.fg} />
            <span>TRAVELIO</span>
          </div>
        </div>
      </div>
    );
  }
);
