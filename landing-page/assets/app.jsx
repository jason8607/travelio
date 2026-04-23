// Top nav + Tweaks panel + App shell

function Nav({ copy, lang, theme, appUrl }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "color-mix(in srgb, var(--bg) 88%, transparent)" : "transparent",
      backdropFilter: scrolled ? "blur(12px) saturate(150%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(12px) saturate(150%)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "all 220ms ease",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink-1)" }}>
          <img src="icon-512.png" alt="旅帳" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", display: "block" }}/>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{copy.brand}</div>
            <div style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", marginTop: 2 }}>{copy.brandSub}</div>
          </div>
        </a>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="nav-links">
          <a href="#features" style={navLink}>{copy.nav.features}</a>
          <a href="#how" style={navLink}>{copy.nav.how}</a>
          <a href="#recap" style={navLink}>{copy.nav.recap}</a>
          <a href="#tech" style={navLink}>{copy.nav.tech}</a>
          <a href="#faq" style={navLink}>{copy.nav.faq}</a>
        </div>
        <a href={appUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 13 }}>
          {lang === "zh" ? "試用" : "Try it"} <span className="ms" style={{ fontSize: 16 }}>arrow_forward</span>
        </a>
      </div>
      <style>{`@media (max-width: 760px) { .nav-links { display: none !important; } }`}</style>
    </nav>
  );
}
const navLink = { textDecoration: "none", color: "var(--ink-2)", fontSize: 14, fontWeight: 500, transition: "color 150ms" };

function TweaksPanel({ copy, settings, setSettings, visible }) {
  const t = copy.tweaks;
  if (!visible) return null;

  const [min, setMin] = React.useState(false);

  const send = (patch) => {
    setSettings({ ...settings, ...patch });
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
    } catch {}
  };

  return (
    <div className="tweaks-panel" style={{
      position: "fixed", right: 20, bottom: 20, zIndex: 200,
      width: min ? 180 : 320,
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderRadius: 18,
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
      color: "var(--ink-1)",
      transition: "width 220ms ease",
    }}>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", background: "var(--bg-paper)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ms" style={{ color: "var(--accent)", fontSize: 18 }}>tune</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</span>
        </div>
        <button onClick={() => setMin(!min)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-3)" }}>
          <span className="ms" style={{ fontSize: 18 }}>{min ? "expand_less" : "expand_more"}</span>
        </button>
      </div>

      {!min && (
        <div style={{ padding: 16, display: "grid", gap: 18, maxHeight: "70vh", overflowY: "auto" }}>
          {/* Theme */}
          <div>
            <div style={twLabel}>{t.theme}</div>
            <div style={{ display: "grid", gap: 6 }}>
              {t.themes.map((th) => (
                <button key={th.key} onClick={() => send({ theme: th.key })} style={twOpt(settings.theme === th.key)}>
                  <ThemeDot k={th.key}/>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{th.name}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{th.desc}</div>
                  </div>
                  {settings.theme === th.key && <span className="ms" style={{ color: "var(--accent)", fontSize: 16 }}>check</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <div style={twLabel}>{t.lang}</div>
            <div style={{ display: "flex", gap: 6, background: "var(--surface-ink)", padding: 3, borderRadius: 10 }}>
              {t.langs.map((l) => (
                <button key={l.key} onClick={() => send({ lang: l.key })} style={{
                  flex: 1, padding: "6px 10px", borderRadius: 8,
                  background: settings.lang === l.key ? "var(--surface)" : "transparent",
                  border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  color: settings.lang === l.key ? "var(--ink-1)" : "var(--ink-3)",
                  boxShadow: settings.lang === l.key ? "var(--shadow-sm)" : "none",
                }}>{l.name}</button>
              ))}
            </div>
          </div>

          {/* Hero variant */}
          <div>
            <div style={twLabel}>{t.hero}</div>
            <div style={{ display: "grid", gap: 6 }}>
              {t.heroes.map((hv) => (
                <button key={hv.key} onClick={() => send({ heroVariant: hv.key })} style={twOpt(settings.heroVariant === hv.key)}>
                  <HeroIcon k={hv.key}/>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{hv.name}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{hv.desc}</div>
                  </div>
                  {settings.heroVariant === hv.key && <span className="ms" style={{ color: "var(--accent)", fontSize: 16 }}>check</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Show tech */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-ink)", borderRadius: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={settings.showTech} onChange={(e) => send({ showTech: e.target.checked })} style={{ accentColor: "var(--accent)", width: 16, height: 16 }}/>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t.showTech}</span>
          </label>
        </div>
      )}
    </div>
  );
}

const twLabel = { fontSize: 10, letterSpacing: "0.18em", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 };
const twOpt = (active) => ({
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
  background: active ? "var(--accent-bg)" : "transparent",
  borderRadius: 10, cursor: "pointer", width: "100%",
  fontFamily: "var(--font-sans)", color: "var(--ink-1)",
});

function ThemeDot({ k }) {
  const map = {
    sakura: ["#FBF7F1", "#D14B3D", "#5B7A4B"],
    amber: ["#1A1410", "#FF9E17", "#FFCE73"],
    monochrome: ["#FFFFFF", "#0A0A0A", "#767674"],
  };
  const [a, b, c] = map[k];
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, background: `conic-gradient(${a} 0 33%, ${b} 33% 66%, ${c} 66% 100%)`, border: "1px solid var(--border)" }}/>
  );
}
function HeroIcon({ k }) {
  const common = { width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--ink-2)" };
  if (k === "centered") return <div style={common}>≡</div>;
  if (k === "split") return <div style={common}>⊡</div>;
  return <div style={common}>⌘</div>;
}

// -------------------- App shell --------------------

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "sakura",
  "lang": "zh",
  "heroVariant": "centered",
  "showTech": true
}/*EDITMODE-END*/;

function App() {
  const [settings, setSettings] = React.useState(TWEAK_DEFAULTS);
  const [tweaksVisible, setTweaksVisible] = React.useState(false);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksVisible(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksVisible(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.documentElement.setAttribute("lang", settings.lang === "zh" ? "zh-Hant" : "en");
  }, [settings.theme, settings.lang]);

  const copy = window.COPY[settings.lang];
  const appUrl = "https://japan-travel-expense.vercel.app/";

  return (
    <>
      <Nav copy={copy} lang={settings.lang} theme={settings.theme} appUrl={appUrl}/>
      <Hero copy={copy} lang={settings.lang} variant={settings.heroVariant} appUrl={appUrl}/>
      <Marquee items={copy.marquee}/>
      <Features copy={copy}/>
      <HowItWorks copy={copy}/>
      <RecapPreview copy={copy}/>
      <Tech copy={copy} show={settings.showTech}/>
      <FAQ copy={copy}/>
      <Footer copy={copy} appUrl={appUrl}/>
      <TweaksPanel copy={copy} settings={settings} setSettings={setSettings} visible={tweaksVisible}/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
