// Hero section — 3 layout variants
const { useState: useStateH, useEffect: useEffectH } = React;

function Hero({ copy, variant, lang, appUrl }) {
  if (variant === "split") return <HeroSplit copy={copy} lang={lang} appUrl={appUrl} />;
  if (variant === "editorial") return <HeroEditorial copy={copy} lang={lang} appUrl={appUrl} />;
  return <HeroCentered copy={copy} lang={lang} appUrl={appUrl} />;
}

function HeroCentered({ copy, lang, appUrl }) {
  const h = copy.hero;
  return (
    <section className="section" style={{ paddingTop: 48, paddingBottom: 80, position: "relative" }}>
      {/* tategaki decoration */}
      {lang === "zh" && (
        <>
          <div className="tategaki tategaki-deco" style={{ position: "absolute", top: 80, left: 24, fontSize: 14, color: "var(--ink-3)", letterSpacing: "0.4em" }}>
            日本旅遊記帳
          </div>
          <div className="tategaki tategaki-deco" style={{ position: "absolute", top: 80, right: 24, fontSize: 14, color: "var(--accent)", letterSpacing: "0.4em" }}>
            旅の財布
          </div>
        </>
      )}

      <div style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", background: "var(--bg-paper)", border: "1px solid var(--border)", borderRadius: 999, fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-2)", marginBottom: 28 }}>
          <span className="hinomaru"/>
          {h.badge}
        </div>

        <h1 className="display" style={{ fontSize: "clamp(36px, 9vw, 96px)", margin: 0, color: "var(--ink-1)" }}>
          <div>{h.title1}</div>
          <div>{h.title2}</div>
          <div style={{ color: "var(--accent)", position: "relative", display: "inline-block", marginTop: 6 }}>
            {h.titleAccent}
            <svg viewBox="0 0 300 20" style={{ position: "absolute", left: 0, bottom: -8, width: "100%", height: 14 }} preserveAspectRatio="none">
              <path d="M2,14 Q75,2 150,10 T298,8" stroke="var(--accent)" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
        </h1>

        <p style={{ fontSize: "clamp(15px, 2.1vw, 19px)", color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 680, margin: "36px auto 0", textWrap: "pretty" }}>
          {h.sub}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
          <a href={appUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
            {h.cta1} <span className="ms" style={{ fontSize: 18 }}>arrow_forward</span>
          </a>
          <a href="#features" className="btn btn-ghost">
            <span className="ms" style={{ fontSize: 18 }}>code</span> {h.cta2}
          </a>
        </div>

        {/* stats */}
        <div className="hero-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 680, margin: "56px auto 0" }}>
          {h.stats.map((s, i) => (
            <div key={i} style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 10px" }}>
              <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 900, color: "var(--accent)", lineHeight: 1 }} className="mono">{s.n}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6, letterSpacing: "0.08em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* phone mock peek */}
      <div className="hero-phones" style={{ display: "flex", justifyContent: "center", marginTop: 72, gap: 24, flexWrap: "wrap" }}>
        <div style={{ transform: "rotate(-5deg) translateY(20px)" }}>
          <PhoneFrame scale={0.65}><MockDashboard/></PhoneFrame>
        </div>
        <div style={{ transform: "translateY(-10px)" }}>
          <PhoneFrame scale={0.72}><MockScan/></PhoneFrame>
        </div>
        <div style={{ transform: "rotate(5deg) translateY(20px)" }}>
          <PhoneFrame scale={0.65}><MockRecap/></PhoneFrame>
        </div>
      </div>
    </section>
  );
}

function HeroSplit({ copy, lang, appUrl }) {
  const h = copy.hero;
  return (
    <section className="section" style={{ paddingTop: 56 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "center" }} className="hero-split-grid">
        <div>
          <div style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 11, letterSpacing: "0.2em", color: "var(--accent)", marginBottom: 24 }}>
            <span className="hinomaru"/> {h.badge}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 7vw, 80px)", margin: 0 }}>
            {h.title1}<br/>{h.title2}<br/>
            <span style={{ color: "var(--accent)" }}>{h.titleAccent}</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--ink-2)", lineHeight: 1.65, marginTop: 28, maxWidth: 520, textWrap: "pretty" }}>{h.sub}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <a href={appUrl} target="_blank" rel="noreferrer" className="btn btn-primary">{h.cta1} <span className="ms" style={{ fontSize: 18 }}>arrow_forward</span></a>
            <a href="#features" className="btn btn-ghost"><span className="ms" style={{ fontSize: 18 }}>code</span> {h.cta2}</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 48, maxWidth: 520 }}>
            {h.stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink-1)" }} className="mono">{s.n}</div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          {/* floating second phone */}
          <div style={{ position: "absolute", top: 40, right: -20, transform: "rotate(8deg)", zIndex: 1, opacity: 0.9 }}>
            <PhoneFrame scale={0.55}><MockRecap/></PhoneFrame>
          </div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <PhoneFrame scale={0.88}><MockDashboard/></PhoneFrame>
          </div>
          {/* hanko */}
          <div className="hanko" style={{ position: "absolute", top: 12, left: 12, zIndex: 3 }}>
            {lang === "zh" ? "旅・帳" : "TABI"}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .hero-split-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-split-grid > div:last-child { min-height: 520px; }
        }
        @media (max-width: 480px) {
          .hero-split-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

function HeroEditorial({ copy, lang, appUrl }) {
  const h = copy.hero;
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div style={{ borderTop: "1px solid var(--border-strong)", borderBottom: "1px solid var(--border-strong)", padding: "14px 0", marginBottom: 48, display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: "0.25em", color: "var(--ink-2)" }}>
        <span>ISSUE № 01</span>
        <span>{h.badge}</span>
        <span>{lang === "zh" ? "旅帳 · 日本旅遊記帳" : "TABICHŌ · JAPAN EXPENSE"}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 32 }} className="hero-ed-grid hero-ed-root">
        <div style={{ borderRight: "1px solid var(--border)", paddingRight: 24 }}>
          <div className="eyebrow">Vol.</div>
          <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "var(--font-serif)", lineHeight: 1, marginTop: 8 }}>01</div>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 20, lineHeight: 1.6 }}>
            {lang === "zh"
              ? "一趟九日東京京都行，83 筆消費，3 人分帳，產出一個 side project。"
              : "Nine days in Japan, 83 receipts, 3 travelers split — and one side project."}
          </p>
        </div>

        <div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 7vw, 92px)", margin: 0, textAlign: "center" }}>
            {h.title1}<br/>{h.title2}<br/>
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>{h.titleAccent}</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2vw, 17px)", color: "var(--ink-2)", lineHeight: 1.6, textAlign: "center", maxWidth: 560, margin: "32px auto 0" }}>{h.sub}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
            <a href={appUrl} target="_blank" rel="noreferrer" className="btn btn-primary">{h.cta1} <span className="ms" style={{ fontSize: 18 }}>arrow_forward</span></a>
            <a href="#features" className="btn btn-ghost">{h.cta2}</a>
          </div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 24 }}>
          <div className="eyebrow">By</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Solo developer</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Next.js · Supabase · Gemini</div>
          <div style={{ display: "grid", gap: 8, marginTop: 20 }}>
            {h.stats.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>
                <span style={{ color: "var(--ink-3)" }}>{s.l}</span>
                <span className="mono" style={{ fontWeight: 700, color: "var(--ink-1)" }}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 56, gap: 24, flexWrap: "wrap" }}>
        <PhoneFrame scale={0.65}><MockDashboard/></PhoneFrame>
        <PhoneFrame scale={0.65}><MockScan/></PhoneFrame>
        <PhoneFrame scale={0.65}><MockSplit/></PhoneFrame>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .hero-ed-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .hero-ed-grid > div:first-child { border-right: none !important; padding-right: 0 !important; border-bottom: 1px solid var(--border); padding-bottom: 20px; }
          .hero-ed-grid > div:last-child { border-left: none !important; padding-left: 0 !important; border-top: 1px solid var(--border); padding-top: 20px; }
        }
      `}</style>
    </section>
  );
}

Object.assign(window, { Hero });

function StatPill({ s, compact }) {
  return (
    <div style={{
      background: "var(--bg-paper)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      padding: compact ? "12px 10px" : "16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
      textAlign: "left",
      minHeight: compact ? 92 : 112,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: compact ? 20 : 24 }}>{s.icon}</span>
        <span style={{ fontSize: compact ? 14 : 16, fontWeight: 800, color: "var(--ink-1)" }}>{s.n}</span>
      </div>
      <div style={{ fontSize: compact ? 10 : 11, color: "var(--ink-3)", lineHeight: 1.4, textWrap: "balance" }}>{s.l}</div>
      <StatViz kind={s.viz}/>
    </div>
  );
}

function StatViz({ kind }) {
  const base = { marginTop: "auto", height: 18, display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-3)" };
  if (kind === "ocr") {
    return (
      <div style={base}>
        <span style={{ flex: 1, height: 2, background: "linear-gradient(90deg, var(--accent) 0 70%, var(--border) 70%)", borderRadius: 2 }}/>
        <span style={{ color: "var(--accent)", fontWeight: 700 }}>¥5,660</span>
      </div>
    );
  }
  if (kind === "split") {
    return (
      <div style={{ ...base, justifyContent: "space-between" }}>
        <span style={{ display: "flex", gap: -4 }}>
          {["🦊","🐶","🐱"].map((e,i)=>(<span key={i} style={{ fontSize: 11, marginLeft: i?-4:0, background: "var(--surface)", borderRadius: "50%", width: 14, height: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>{e}</span>))}
        </span>
        <span>÷ 3</span>
      </div>
    );
  }
  if (kind === "cashback") {
    return (
      <div style={{ ...base, gap: 2 }}>
        {[2.8, 2.0, 1.5].map((p,i)=>(
          <span key={i} style={{ flex: p, height: 4, background: i===0?"var(--accent)":"var(--border-strong)", borderRadius: 2 }}/>
        ))}
        <span style={{ color: "var(--accent)", fontWeight: 700, marginLeft: 4 }}>2.8%</span>
      </div>
    );
  }
  if (kind === "budget") {
    return (
      <div style={{ ...base, flexDirection: "column", alignItems: "stretch", gap: 3 }}>
        <div style={{ height: 4, background: "var(--surface-ink)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg, var(--pine), var(--accent))" }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8 }}>
          <span>72%</span>
          <span>¥120k</span>
        </div>
      </div>
    );
  }
  return null;
}

Object.assign(window, { StatPill });
