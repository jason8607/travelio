// Features section — 6 pillars with interactive demos
const { useState: useStateF } = React;

function Features({ copy }) {
  const [active, setActive] = useStateF(0);
  const f = copy.features;
  const item = f.items[active];

  return (
    <section id="features" className="section">
      <div className="section-head">
        <div className="eyebrow">{f.eyebrow}</div>
        <h2>{f.title}</h2>
        <p>{f.sub}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "start" }} className="features-grid">
        {/* Left — feature list */}
        <div style={{ display: "grid", gap: 12 }}>
          {f.items.map((it, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                textAlign: "left",
                border: "1px solid " + (i === active ? "var(--accent)" : "var(--border)"),
                background: i === active ? "var(--bg-paper)" : "transparent",
                padding: "18px 20px",
                borderRadius: 16,
                cursor: "pointer",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                transition: "all 180ms ease",
                fontFamily: "var(--font-sans)",
                color: "var(--ink-1)",
                boxShadow: i === active ? "0 8px 24px -8px color-mix(in srgb, var(--accent) 30%, transparent)" : "none",
              }}
              onMouseEnter={(e) => { if (i !== active) e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { if (i !== active) e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: i === active ? "var(--accent)" : "var(--surface-ink)",
                color: i === active ? "#fff" : "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 180ms",
              }}>
                <span className="ms" style={{ fontSize: 22 }}>{it.icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", background: "var(--accent-bg)", color: "var(--accent-deep)", borderRadius: 999, fontWeight: 700, letterSpacing: "0.08em" }}>{it.tag}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-1)", marginBottom: 4 }}>{it.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{it.body}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Right — interactive demo */}
        <div style={{ position: "sticky", top: 100 }}>
          <FeatureDemo demo={item.demo} key={item.demo}/>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .features-grid { grid-template-columns: 1fr !important; } .features-grid > div:last-child { position: static !important; } }`}</style>
    </section>
  );
}

function FeatureDemo({ demo }) {
  if (demo === "ocr") return <DemoWrapper><PhoneFrame scale={0.95}><MockScan/></PhoneFrame></DemoWrapper>;
  if (demo === "split") return <DemoWrapper><PhoneFrame scale={0.95}><MockSplit/></PhoneFrame></DemoWrapper>;
  if (demo === "recap") return <DemoWrapper><PhoneFrame scale={0.95}><MockRecap/></PhoneFrame></DemoWrapper>;
  if (demo === "dashboard") return <DemoWrapper><PhoneFrame scale={0.95}><MockDashboard/></PhoneFrame></DemoWrapper>;
  if (demo === "card") return <DemoWrapper><DemoCard/></DemoWrapper>;
  if (demo === "pwa") return <DemoWrapper><DemoPWA/></DemoWrapper>;
  return null;
}

function DemoWrapper({ children }) {
  return (
    <div className="demo-wrap" style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: 32, borderRadius: 24,
      background: "linear-gradient(160deg, var(--surface-ink), var(--bg-paper))",
      border: "1px solid var(--border)",
      minHeight: 560,
      animation: "fadeIn 260ms ease",
    }}>
      {children}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

function DemoCard() {
  const cards = [
    { name: "台新 Richart", plan: "海外回饋", pct: 2.8, used: 52400, cap: 100000, color: "linear-gradient(135deg, #1a3a6e, #0a1e4a)" },
    { name: "國泰 Cube", plan: "玩數位", pct: 2.0, used: 28200, cap: 50000, color: "linear-gradient(135deg, #5b3a1e, #8c5a2e)" },
    { name: "聯邦 賴點", plan: "LINE Pay 回饋", pct: 1.5, used: 6860, cap: 30000, color: "linear-gradient(135deg, #2e6b4a, #1a4a30)" },
  ];
  return (
    <div style={{ width: "100%", maxWidth: 380, display: "grid", gap: 12 }}>
      {cards.map((c, i) => {
        const pct = c.used / c.cap;
        return (
          <div key={i} style={{ background: c.color, borderRadius: 16, padding: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{c.plan}</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{c.name}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }} className="mono">{c.pct}%</div>
            </div>
            <div style={{ marginTop: 18, fontSize: 11, opacity: 0.8, display: "flex", justifyContent: "space-between" }}>
              <span>已刷 NT${c.used.toLocaleString()}</span>
              <span>上限 NT${c.cap.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: pct * 100 + "%", height: "100%", background: "#fff", borderRadius: 3 }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DemoPWA() {
  return (
    <div style={{ width: "100%", maxWidth: 360, display: "grid", gap: 14 }}>
      <div style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", borderRadius: 20, padding: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <img src="icon-512.png" alt="旅帳" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", display: "block" }}/>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink-1)" }}>旅帳</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>japan-travel-expense.vercel.app</div>
          </div>
        </div>
        <button style={{ width: "100%", padding: "10px", background: "var(--ink-1)", color: "var(--ink-on-deep)", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
          <span className="ms" style={{ fontSize: 16, verticalAlign: "-3px", marginRight: 6 }}>install_mobile</span>
          安裝到主畫面
        </button>
      </div>

      <div style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span className="ms" style={{ fontSize: 28, color: "var(--pine)" }}>wifi_off</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-1)" }}>離線模式啟用中</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>已記錄 3 筆，回到網路時自動同步</div>
        </div>
        <span className="ms" style={{ fontSize: 20, color: "var(--pine)" }}>cloud_done</span>
      </div>

      <div style={{ background: "var(--bg-paper)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 10 }}>GUEST → 帳號</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Guest 資料</div>
          <span className="ms" style={{ color: "var(--accent)" }}>arrow_forward</span>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Supabase</div>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--pine)", fontWeight: 700 }}>一鍵遷移 ✓</span>
        </div>
      </div>
    </div>
  );
}

// Marquee ticker
function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-paper)", overflow: "hidden", padding: "18px 0" }}>
      <div style={{ display: "flex", gap: 48, animation: "marquee 42s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
        {doubled.map((t, i) => (
          <span key={i} style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 48, letterSpacing: "0.08em" }}>
            {t}
            <span style={{ color: "var(--accent)" }}>◆</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

Object.assign(window, { Features, Marquee });
