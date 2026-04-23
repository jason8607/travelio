// Phone Frame + mock app screens for 旅帳 landing
// Components are attached to window for cross-script use.

const { useState, useEffect, useMemo } = React;

// ---------------- iPhone bezel ----------------

function PhoneFrame({ children, scale = 1, theme = "light" }) {
  const baseW = 320;
  const baseH = 680;
  return (
    <div
      style={{
        width: baseW * scale,
        height: baseH * scale,
        position: "relative",
        filter: "drop-shadow(0 30px 60px rgba(69,45,22,0.25)) drop-shadow(0 10px 24px rgba(69,45,22,0.18))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: baseW,
          height: baseH,
          borderRadius: 48,
          padding: 10,
          background: "linear-gradient(180deg, #2a2a2e 0%, #0e0e10 100%)",
          boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 6px #000",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 38,
            overflow: "hidden",
            background: theme === "dark" ? "#0f0f10" : "#FBF8F2",
            position: "relative",
          }}
        >
          {/* notch */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 88,
              height: 26,
              borderRadius: 18,
              background: "#000",
              zIndex: 20,
            }}
          />
          {/* status bar */}
          <div
            style={{
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 22px 0",
              fontSize: 13,
              fontWeight: 600,
              color: theme === "dark" ? "#fff" : "#1F1812",
              position: "relative",
              zIndex: 15,
            }}
          >
            <span className="mono">9:41</span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span className="ms" style={{ fontSize: 14 }}>signal_cellular_4_bar</span>
              <span className="ms" style={{ fontSize: 14 }}>wifi</span>
              <span className="ms" style={{ fontSize: 16 }}>battery_full</span>
            </span>
          </div>
          <div style={{ height: "calc(100% - 42px)", overflow: "hidden", position: "relative" }}>
            {children}
          </div>
          {/* home indicator */}
          <div
            style={{
              position: "absolute",
              bottom: 7,
              left: "50%",
              transform: "translateX(-50%)",
              width: 120,
              height: 4,
              borderRadius: 3,
              background: theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
              zIndex: 20,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------- Mock app: Dashboard ----------------

function MockDashboard() {
  const budget = 120000;
  const used = 87460;
  const pct = Math.min(1, used / budget);
  return (
    <div style={{ padding: "8px 16px 20px", fontFamily: "var(--font-sans)", color: "#1F1812", background: "#FBF8F2", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 12px" }}>
        <div>
          <div style={{ fontSize: 11, color: "#8C7E6E", letterSpacing: "0.08em" }}>TRIP</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>東京 · 京都 9 日</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #E89CB3, #D14B3D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🦊</div>
      </div>

      {/* FX pill */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, background: "#fff", border: "1px solid #E7DCC7", borderRadius: 999, padding: "4px 10px", color: "#564A3E", marginBottom: 10 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#5B7A4B" }}/> JPY 100 ≈ TWD 22.01
      </div>

      {/* Hero number */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 16, border: "1px solid #F0E6D2", boxShadow: "0 1px 2px rgba(69,45,22,0.04)" }}>
        <div style={{ fontSize: 11, color: "#8C7E6E" }}>旅程總支出</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginTop: 2 }}>¥87,460</div>
        <div style={{ fontSize: 11, color: "#8C7E6E" }}>≈ NT$19,244 · 42 筆</div>
        <div style={{ marginTop: 12, height: 6, background: "#F3EBDC", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: pct * 100 + "%", height: "100%", background: "linear-gradient(90deg, #D14B3D, #E89CB3)" }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8C7E6E", marginTop: 6 }}>
          <span>預算 ¥{budget.toLocaleString()}</span>
          <span>{Math.round(pct*100)}%</span>
        </div>
      </div>

      {/* Today card */}
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 10, border: "1px solid #F0E6D2" }}>
          <div style={{ fontSize: 10, color: "#8C7E6E" }}>今日</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>¥8,920</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 10, border: "1px solid #F0E6D2" }}>
          <div style={{ fontSize: 10, color: "#8C7E6E" }}>回饋</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#5B7A4B" }}>NT$612</div>
        </div>
      </div>

      {/* Recent list */}
      <div style={{ marginTop: 12, fontSize: 10, fontWeight: 600, color: "#8C7E6E", letterSpacing: "0.08em", padding: "0 2px" }}>最近消費</div>
      {[
        { icon: "🍜", title: "一蘭拉麵 道頓堀店", cat: "餐飲", amt: "¥1,290", pay: "💳" },
        { icon: "🚆", title: "JR 京都 → 大阪", cat: "交通", amt: "¥570", pay: "💴" },
        { icon: "🛍️", title: "LoFt 梅田店", cat: "購物", amt: "¥4,280", pay: "💳" },
        { icon: "🏨", title: "東橫 INN 住宿一晚", cat: "住宿", amt: "¥7,800", pay: "💳", split: true },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fff", borderRadius: 12, marginTop: 6, border: "1px solid #F3EBDC" }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "#FCE8E4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{r.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
            <div style={{ fontSize: 9, color: "#8C7E6E", display: "flex", gap: 4, marginTop: 1 }}>
              <span>{r.cat}</span><span>·</span><span>{r.pay}</span>
              {r.split && <><span>·</span><span style={{ color: "#D14B3D" }}>均分</span></>}
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700 }} className="mono">{r.amt}</div>
        </div>
      ))}

      {/* Bottom nav */}
      <div style={{ position: "absolute", bottom: 18, left: 12, right: 12, display: "flex", justifyContent: "space-around", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 20, border: "1px solid #E7DCC7", padding: "8px 4px" }}>
        {[
          { i: "home", l: "首頁", a: true },
          { i: "add_a_photo", l: "掃描" },
          { i: "receipt_long", l: "紀錄" },
          { i: "bar_chart", l: "統計" },
          { i: "celebration", l: "回顧" },
        ].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: n.a ? "#D14B3D" : "#8C7E6E", fontSize: 9, fontWeight: 500, padding: "2px 4px" }}>
            <span className="ms" style={{ fontSize: 18 }}>{n.i}</span>
            <span>{n.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Mock app: Scan / OCR ----------------

function MockScan() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 2800);
    return () => clearInterval(t);
  }, []);
  const items = [
    { ja: "特選黒毛和牛カルビ", zh: "特選黑毛和牛五花", yen: 2800 },
    { ja: "ハラミ定食", zh: "橫膈膜定食", yen: 1980 },
    { ja: "生ビール 中", zh: "生啤酒（中）", yen: 680 },
    { ja: "ご飯 大盛り", zh: "白飯大份", yen: 200 },
  ];
  return (
    <div style={{ height: "100%", background: "#1B1310", color: "#FBF3E3", position: "relative", fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="ms">close</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>AI 辨識收據</span>
        <span style={{ fontSize: 10, color: "#D6C4A4" }}>49/50</span>
      </div>

      {/* camera view frame */}
      <div style={{ margin: "8px 16px", aspectRatio: "4/5", borderRadius: 20, background: "#fff", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* fake receipt */}
        <div style={{ position: "absolute", inset: 16, background: "#F7F0E0", borderRadius: 4, padding: 10, color: "#1F1812", fontSize: 8, fontFamily: "'Roboto Mono', monospace", lineHeight: 1.6, transform: "rotate(-1.5deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 10, marginBottom: 2 }}>焼肉 牛角</div>
          <div style={{ textAlign: "center", fontSize: 7, color: "#8C7E6E" }}>難波道頓堀店</div>
          <div style={{ textAlign: "center", fontSize: 7, color: "#8C7E6E", marginBottom: 4 }}>2025/04/08 20:14</div>
          <div style={{ borderTop: "1px dashed #aaa", borderBottom: "1px dashed #aaa", padding: "3px 0", margin: "3px 0" }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{it.ja}</span>
                <span>¥{it.yen.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>合計 (税込)</span>
            <span>¥5,660</span>
          </div>
        </div>

        {/* scanner laser */}
        {step === 0 && (
          <>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: "linear-gradient(180deg, transparent 0%, rgba(209,75,61,0.3) 48%, transparent 50%)", animation: "scanSweep 2.2s linear infinite" }}/>
            <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, textAlign: "center", fontSize: 10, color: "#fff", fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
              <span style={{ display: "inline-block", padding: "4px 10px", background: "rgba(209,75,61,0.9)", borderRadius: 999 }}>
                <span className="ms" style={{ fontSize: 10, verticalAlign: "-2px" }}>auto_awesome</span> 辨識中…
              </span>
            </div>
          </>
        )}
      </div>

      {/* Bottom sheet — extracted */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#2C2218", borderRadius: "24px 24px 0 0", padding: "14px 16px 28px", borderTop: "1px solid rgba(251,243,227,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#D6C4A4" }}>辨識結果</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>焼肉 牛角 · 道頓堀</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900 }} className="mono">¥5,660</div>
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          {items.slice(0, 3).map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, background: "rgba(251,243,227,0.06)", borderRadius: 8, padding: "6px 8px" }}>
              <span className="ms" style={{ fontSize: 12, color: "#FF9E17" }}>check_circle</span>
              <span style={{ flex: 1 }}>{it.zh}</span>
              <span className="mono" style={{ color: "#D6C4A4" }}>¥{it.yen.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", marginTop: 10, padding: "10px", background: "#D14B3D", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>
          下一步：逐條分帳 →
        </button>
      </div>

      <style>{`
        @keyframes scanSweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}

// ---------------- Mock app: Recap card ----------------

function MockRecap() {
  return (
    <div style={{ height: "100%", padding: 16, background: "linear-gradient(160deg, #FBE3EB 0%, #FCE8E4 45%, #F0E3C6 100%)", overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="ms" style={{ color: "#1F1812" }}>arrow_back</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1F1812" }}>旅後回顧</span>
        <span className="ms" style={{ color: "#1F1812" }}>ios_share</span>
      </div>

      <div style={{ background: "linear-gradient(140deg, #D14B3D 0%, #9E2E24 100%)", color: "#fff", borderRadius: 20, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
        <img src="icon-512.png" alt="旅帳" style={{ width: 36, height: 36, borderRadius: 10, display: "block", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}/>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>東京 · 京都 9 日</div>
        <div style={{ fontSize: 9, opacity: 0.8 }}>2025.04.03 – 04.11</div>

        <div style={{ fontSize: 9, opacity: 0.8, marginTop: 14 }}>總花費</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }} className="mono">¥287,460</div>
        <div style={{ fontSize: 9, opacity: 0.8 }}>≈ NT$63,240 · 83 筆</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12, fontSize: 9 }}>
          <div><div style={{ opacity: 0.7 }}>消費筆數</div><div style={{ fontSize: 13, fontWeight: 800 }}>83</div></div>
          <div><div style={{ opacity: 0.7 }}>消費天數</div><div style={{ fontSize: 13, fontWeight: 800 }}>9</div></div>
          <div><div style={{ opacity: 0.7 }}>日均</div><div style={{ fontSize: 13, fontWeight: 800 }}>¥31.9k</div></div>
        </div>

        <div style={{ marginTop: 10, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 10, fontSize: 9, lineHeight: 1.9 }}>
          <div>🏆 最愛類別：🍜 餐飲</div>
          <div>🏪 最常造訪：7-ELEVEN（11次）</div>
          <div>💸 最貴一筆：HARBS ¥38,500</div>
          <div>💳 信用卡回饋：NT$2,180</div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10 }}>
        <button style={{ padding: "8px", border: "1px solid #1F1812", borderRadius: 10, background: "#fff", fontWeight: 600, color: "#1F1812" }}>
          <span className="ms" style={{ fontSize: 12, verticalAlign: "-2px" }}>download</span> 下載圖片
        </button>
        <button style={{ padding: "8px", border: "none", borderRadius: 10, background: "#1F1812", color: "#fff", fontWeight: 600 }}>
          <span className="ms" style={{ fontSize: 12, verticalAlign: "-2px" }}>share</span> 分享 LINE
        </button>
      </div>
    </div>
  );
}

// ---------------- Mock app: Settlement split ----------------

function MockSplit() {
  const members = [
    { name: "你", emoji: "🦊", paid: 42300, owes: 0 },
    { name: "旅伴 A", emoji: "🐶", paid: 18700, owes: 8200 },
    { name: "旅伴 B", emoji: "🐱", paid: 26460, owes: 0 },
  ];
  return (
    <div style={{ padding: "10px 16px", height: "100%", background: "#FBF8F2", overflow: "hidden", fontFamily: "var(--font-sans)", color: "#1F1812" }}>
      <div style={{ fontSize: 11, color: "#8C7E6E", letterSpacing: "0.08em" }}>SETTLEMENT</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>結算摘要</div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 14, border: "1px solid #E7DCC7" }}>
        <div style={{ fontSize: 10, color: "#8C7E6E" }}>總花費</div>
        <div style={{ fontSize: 22, fontWeight: 900 }} className="mono">¥87,460</div>
        <div style={{ fontSize: 10, color: "#8C7E6E" }}>3 人均分 · 每人 ¥29,153</div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {members.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: "#FCE8E4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 9, color: "#8C7E6E" }}>已付 ¥{m.paid.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: m.owes > 0 ? "#D14B3D" : "#5B7A4B" }} className="mono">
                {m.owes > 0 ? `-¥${m.owes.toLocaleString()}` : "✓"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 10, fontWeight: 600, color: "#8C7E6E", letterSpacing: "0.08em" }}>最小轉帳方案</div>
      <div style={{ marginTop: 6, background: "#fff", borderRadius: 14, padding: 12, border: "1px dashed #D14B3D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          <span>🐶 旅伴 A</span>
          <span className="ms" style={{ fontSize: 14, color: "#D14B3D" }}>arrow_forward</span>
          <span>🦊 你</span>
          <span style={{ marginLeft: "auto", fontWeight: 800 }} className="mono">¥8,200</span>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 10, fontWeight: 600, color: "#8C7E6E", letterSpacing: "0.08em" }}>品項歸屬</div>
      <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
        {[
          { i: "🍜", t: "一蘭拉麵 x 3", tag: "均分", tagColor: "#5B7A4B", amt: "¥3,870" },
          { i: "🎁", t: "東京香蕉伴手禮", tag: "幫旅伴B付", tagColor: "#B88A3B", amt: "¥1,620" },
          { i: "🏨", t: "東橫 INN", tag: "均分", tagColor: "#5B7A4B", amt: "¥23,400" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: 8, borderRadius: 10, border: "1px solid #F3EBDC", fontSize: 10 }}>
            <span style={{ fontSize: 16 }}>{r.i}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{r.t}</div>
              <span style={{ fontSize: 8, color: r.tagColor, background: r.tagColor + "18", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{r.tag}</span>
            </div>
            <span className="mono" style={{ fontWeight: 700 }}>{r.amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PhoneFrame, MockDashboard, MockScan, MockRecap, MockSplit });
