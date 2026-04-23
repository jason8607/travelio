// How it works + Recap + Tech + FAQ + Footer

function HowItWorks({ copy }) {
  const h = copy.how;
  return (
    <section id="how" className="section" style={{ background: "var(--bg-paper)", maxWidth: "none", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div className="section-head">
          <div className="eyebrow">{h.eyebrow}</div>
          <h2>{h.title}</h2>
          <p>{h.sub}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, position: "relative" }} className="how-grid">
          {/* connecting line */}
          <div style={{ position: "absolute", top: 30, left: "12%", right: "12%", height: 2, background: "repeating-linear-gradient(90deg, var(--border-strong) 0 8px, transparent 8px 16px)", zIndex: 0 }} className="how-line"/>

          {h.steps.map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, position: "relative", zIndex: 1 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: 22, marginBottom: 18, boxShadow: "0 8px 20px -8px var(--accent)" }} className="mono">
                {s.step}
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, letterSpacing: "0.15em", color: "var(--accent)", marginBottom: 6 }}>
                {s.jp}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink-1)", marginBottom: 8 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .how-grid { grid-template-columns: 1fr 1fr !important; }
          .how-line { display: none; }
        }
        @media (max-width: 560px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function RecapPreview({ copy }) {
  const r = copy.recap;
  const [idx, setIdx] = React.useState(0);
  const card = r.cards[idx];

  return (
    <section id="recap" className="section">
      <div className="section-head">
        <div className="eyebrow">{r.eyebrow}</div>
        <h2>{r.title}</h2>
        <p>{r.sub}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 56, alignItems: "center" }} className="recap-grid">
        {/* Left — the story card (Wrapped style) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="recap-card" style={{
            width: 340,
            minHeight: 560,
            borderRadius: 28,
            padding: 32,
            background: idx === 0 ? "linear-gradient(160deg, #D14B3D, #9E2E24)"
                     : idx === 1 ? "linear-gradient(160deg, #E89CB3, #D14B3D)"
                     : idx === 2 ? "linear-gradient(160deg, #5B7A4B, #2F4A20)"
                     : idx === 3 ? "linear-gradient(160deg, #B88A3B, #6E5422)"
                     : idx === 4 ? "linear-gradient(160deg, #1F1812, #3A2C1F)"
                     : "linear-gradient(160deg, #9E2E24, #1F1812)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-lg)",
            transition: "background 420ms ease",
          }}>
            {/* decorative */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
            <div style={{ position: "absolute", bottom: -60, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}/>

            <div style={{ position: "relative", zIndex: 1 }}>
              <img src="icon-512.png" alt="旅帳" style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 6, display: "block", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}/>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--font-serif)" }}>{r.tripName}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, letterSpacing: "0.1em" }}>WRAPPED · 2025</div>

              <div style={{ marginTop: 56 }}>
                <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: "0.1em" }}>{card.title}</div>
                <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 8 }} className="mono">{card.big}</div>
                <div style={{ fontSize: 15, opacity: 0.85, marginTop: 6 }}>{card.sub}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 16, lineHeight: 1.5 }}>{card.note}</div>
              </div>

              <div style={{ position: "absolute", bottom: -20, right: 0, fontSize: 10, opacity: 0.5, letterSpacing: "0.1em" }}>
                旅帳 · TABICHŌ
              </div>
            </div>

            {/* progress dots */}
            <div style={{ position: "absolute", top: 24, right: 32, display: "flex", gap: 4 }}>
              {r.cards.map((_, i) => (
                <div key={i} style={{ width: 16, height: 3, borderRadius: 2, background: i === idx ? "#fff" : "rgba(255,255,255,0.35)" }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Right — selector list */}
        <div>
          <div style={{ display: "grid", gap: 10 }}>
            {r.cards.map((c, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                textAlign: "left",
                padding: "14px 18px",
                border: "1px solid " + (i === idx ? "var(--ink-1)" : "var(--border)"),
                background: i === idx ? "var(--ink-1)" : "transparent",
                color: i === idx ? "var(--ink-on-deep)" : "var(--ink-1)",
                borderRadius: 14,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                display: "flex", alignItems: "center", gap: 14,
                transition: "all 180ms",
              }}>
                <div className="mono" style={{ fontSize: 11, opacity: 0.6, minWidth: 24 }}>{String(i+1).padStart(2, "0")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{c.sub}</div>
                </div>
                <span className="ms" style={{ fontSize: 18, opacity: i === idx ? 1 : 0.4 }}>arrow_forward</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 16, background: "var(--surface-ink)", borderRadius: 14, fontSize: 13, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="ms" style={{ color: "var(--accent)", fontSize: 22 }}>ios_share</span>
            <span>html-to-image 一鍵匯出圖片 · Web Share API 直接分享到 LINE / IG</span>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .recap-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function Tech({ copy, show }) {
  if (!show) return null;
  const t = copy.tech;
  return (
    <section id="tech" className="section" style={{ background: "var(--surface-deep)", color: "var(--ink-on-deep)", maxWidth: "none", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div className="section-head" style={{ color: "var(--ink-on-deep)" }}>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>{t.eyebrow}</div>
          <h2 style={{ color: "var(--ink-on-deep)" }}>{t.title}</h2>
          <p style={{ color: "var(--ink-subtle-on-deep)" }}>{t.sub}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {t.stack.map((g, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.2em", marginBottom: 12 }}>{g.cat.toUpperCase()}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {g.items.map((x, j) => (
                  <div key={j} style={{ fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }} className="mono">
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }}/>
                    {x}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture highlights */}
        <div style={{ marginTop: 48, padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, color: "var(--ink-on-deep)" }}>{t.arch.title}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {t.arch.bullets.map((b, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.15em", marginBottom: 8 }} className="mono">0{i+1}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-on-deep)", marginBottom: 6 }}>{b.k}</div>
                <div style={{ fontSize: 13, color: "var(--ink-subtle-on-deep)", lineHeight: 1.65 }}>{b.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ({ copy }) {
  const f = copy.faq;
  const [open, setOpen] = React.useState(0);

  return (
    <section id="faq" className="section">
      <div className="section-head">
        <div className="eyebrow">{f.eyebrow}</div>
        <h2>{f.title}</h2>
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 860 }}>
        {f.items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg-paper)", overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} style={{
                width: "100%",
                textAlign: "left",
                padding: "20px 22px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--ink-1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}>
                <span>{it.q}</span>
                <span className="ms" style={{ fontSize: 24, color: "var(--accent)", transition: "transform 180ms", transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}>add</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 22px 22px", fontSize: 15, color: "var(--ink-2)", lineHeight: 1.7 }}>
                  {it.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Footer({ copy, appUrl }) {
  const f = copy.footer;
  return (
    <>
      {/* Final CTA */}
      <section className="section" style={{ padding: "64px 24px 120px" }}>
        <div className="cta-box" style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)",
          color: "#fff",
          borderRadius: 28,
          padding: "64px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}/>
          <div style={{ position: "absolute", bottom: -80, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 14, letterSpacing: "0.3em", opacity: 0.8, marginBottom: 12 }}>{f.cta}</div>
            <div className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.1, marginBottom: 18 }}>
              {f.ctaSub}
            </div>
            <a href={appUrl} target="_blank" rel="noreferrer" className="btn" style={{ background: "#fff", color: "var(--accent-deep)", padding: "16px 32px", fontSize: 17, marginTop: 14 }}>
              {f.ctaBtn} <span className="ms" style={{ fontSize: 20 }}>arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", background: "var(--bg-paper)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="icon-512.png" alt="旅帳" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", display: "block" }}/>
            <div>
              <div style={{ fontWeight: 800, color: "var(--ink-1)" }}>{copy.brand}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.built}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{f.copy}</div>
        </div>
      </footer>
    </>
  );
}

Object.assign(window, { HowItWorks, RecapPreview, Tech, FAQ, Footer });
