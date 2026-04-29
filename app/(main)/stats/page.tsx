"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { useExpenses } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { CategoryChart } from "@/components/stats/category-chart";
import { PaymentChart } from "@/components/stats/payment-chart";
import { TopExpenses } from "@/components/stats/top-expenses";
import { CashbackChart } from "@/components/stats/cashback-chart";
import { DayTabs, PRE_TRIP_KEY } from "@/components/stats/day-tabs";
import { formatJPY, formatTWD, formatCompactJPY } from "@/lib/exchange-rate";
import { formatDateLabel, isPreTripDate } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const DONUT_PALETTE = [
  "var(--ed-vermillion)",
  "#7a6441",
  "#b08a42",
  "#8a8373",
  "#4A463E",
  "#C8371D",
];

export default function StatsPage() {
  const { currentTrip, loading: ctxLoading } = useApp();
  const { expenses, loading } = useExpenses();
  const { categories } = useCategories();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dates = useMemo(() => {
    const set = new Set(expenses.map((e) => e.expense_date));
    return [...set].sort();
  }, [expenses]);

  const filtered = useMemo(() => {
    if (!selectedDate) return expenses;
    if (selectedDate === PRE_TRIP_KEY && currentTrip) {
      return expenses.filter((e) => isPreTripDate(e.expense_date, currentTrip.start_date));
    }
    return expenses.filter((e) => e.expense_date === selectedDate);
  }, [expenses, selectedDate, currentTrip]);

  const totalJpy = filtered.reduce((s, e) => s + e.amount_jpy, 0);
  const totalTwd = filtered.reduce((s, e) => s + e.amount_twd, 0);

  const dayBars = useMemo(() => {
    if (!currentTrip) return [];
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.expense_date, (map.get(e.expense_date) ?? 0) + e.amount_jpy);
    }
    const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);
    return entries.map(([date, value]) => ({
      date,
      label: formatDateLabel(date, currentTrip.start_date),
      short: format(parseISO(date), "M.d"),
      value,
      heightPct: max > 0 ? Math.round((value / max) * 95) + 5 : 5,
    }));
  }, [expenses, currentTrip]);

  const donut = useMemo(() => {
    if (totalJpy === 0) return null;
    const known = new Set(categories.map((c) => c.value));
    const items = categories.map((cat) => {
      const amount = filtered
        .filter((e) => e.category === cat.value)
        .reduce((s, e) => s + e.amount_jpy, 0);
      return { name: cat.label, value: amount };
    });
    const unknown = filtered
      .filter((e) => !known.has(e.category))
      .reduce((s, e) => s + e.amount_jpy, 0);
    if (unknown > 0) items.push({ name: "其他", value: unknown });
    const top = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);
    if (top.length === 0) return null;
    let cursor = 0;
    const stops: string[] = [];
    top.forEach((item, i) => {
      const pct = (item.value / totalJpy) * 100;
      const next = cursor + pct;
      stops.push(`${DONUT_PALETTE[i % DONUT_PALETTE.length]} ${cursor.toFixed(2)}% ${next.toFixed(2)}%`);
      cursor = next;
    });
    return { gradient: `conic-gradient(${stops.join(", ")})`, top };
  }, [filtered, categories, totalJpy]);

  if (loading || ctxLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="ed-mono" style={{ fontSize: 11, color: "var(--ed-muted)", letterSpacing: 2 }}>
          LOADING…
        </p>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ padding: 24 }}>
        <div className="ed-page-title-h" style={{ textAlign: "center" }}>
          尚未
          <br />
          建立旅程
        </div>
        <div className="ed-mono" style={{ fontSize: 10, marginTop: 12, letterSpacing: 2, color: "var(--ed-muted)" }}>
          NO TRIP YET
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ padding: 24 }}>
        <div className="ed-page-title-h" style={{ textAlign: "center" }}>
          還沒有
          <br />
          消費紀錄<span className="ed-page-title-dot">.</span>
        </div>
        <div className="ed-mono" style={{ fontSize: 10, marginTop: 12, letterSpacing: 2, color: "var(--ed-muted)" }}>
          NO EXPENSES YET
        </div>
      </div>
    );
  }

  const dateLabel = selectedDate
    ? selectedDate === PRE_TRIP_KEY
      ? "行前"
      : formatDateLabel(selectedDate, currentTrip?.start_date)
    : null;

  const today = new Date();
  const issueNo = String(currentTrip.id).slice(-2).padStart(2, "0").toUpperCase();

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Editorial header */}
      <div className="ed-runhdr">
        <span>STATS — N°{issueNo}</span>
        <span>{format(today, "yyyy.MM.dd")}</span>
      </div>
      <div className="ed-rule" />
      <div className="ed-rule2" />

      {/* PageTitle */}
      <div style={{ padding: "14px 24px 0" }}>
        <div className="ed-page-title-kicker">統 計 報 表</div>
        <div className="ed-page-title-h">
          這趟旅程
          <br />
          花了多少<span className="ed-page-title-dot">.</span>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ marginTop: 18 }}>
        <DayTabs
          dates={dates}
          selected={selectedDate}
          onChange={setSelectedDate}
          tripStartDate={currentTrip?.start_date}
        />
      </div>

      {/* Total */}
      <div style={{ padding: "16px 24px 0" }}>
        <div className="ed-stat-dark">
          <div className="kicker">{dateLabel ? `${dateLabel} 花費` : "全 部 花 費"}</div>
          <div className="num">{formatJPY(totalJpy)}</div>
          <div className="sub">≈ {formatTWD(totalTwd)} · {filtered.length} 筆</div>
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Donut overview */}
        {donut ? (
          <>
            <div className="ed-dotted" />
            <div className="ed-section-head">
              <span className="lbl">總 覽</span>
              <span className="meta">DONUT · TOP {donut.top.length}</span>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div className="ed-donut" style={{ background: donut.gradient }}>
                <div className="ed-donut-label">
                  <span style={{ fontSize: 18, color: "var(--ed-ink)" }}>
                    {formatCompactJPY(totalJpy)}
                  </span>
                  <span
                    className="ed-mono"
                    style={{ fontSize: 9, color: "var(--ed-muted)", letterSpacing: 2, marginTop: 2 }}
                  >
                    {dateLabel ? "區間總計" : "全部總計"}
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {donut.top.map((item, i) => (
                  <div
                    key={item.name}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        background: DONUT_PALETTE[i % DONUT_PALETTE.length],
                        flexShrink: 0,
                      }}
                    />
                    <span className="ed-serif" style={{ flex: 1, color: "var(--ed-ink)" }}>
                      {item.name}
                    </span>
                    <span className="ed-mono" style={{ fontSize: 10, color: "var(--ed-muted)" }}>
                      {Math.round((item.value / totalJpy) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* Daily bars */}
        {dayBars.length > 1 && (
          <>
            <div className="ed-dotted" />
            <div className="ed-section-head">
              <span className="lbl">每 日 支 出</span>
              <span className="meta">DAILY · {dayBars.length} 天</span>
            </div>
            <div className="ed-week-bars">
              {dayBars.map((d) => {
                const isOn = selectedDate === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    className={isOn ? "col on" : "col"}
                    onClick={() => setSelectedDate(isOn ? null : d.date)}
                  >
                    <span>{formatCompactJPY(d.value)}</span>
                    <b style={{ height: `${d.heightPct}%` }} />
                    <em>{d.label || d.short}</em>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="ed-dotted" />
        <CategoryChart
          expenses={filtered}
          title={dateLabel ? `${dateLabel} · 各 類 別` : "各 類 別"}
        />

        <div className="ed-dotted" />
        <PaymentChart
          expenses={filtered}
          title={dateLabel ? `${dateLabel} · 支 付 方 式` : "支 付 方 式"}
        />

        <div className="ed-dotted" />
        <TopExpenses
          expenses={filtered}
          title={dateLabel ? `${dateLabel} · 花 費 排 名` : "花 費 排 名"}
        />

        <div className="ed-dotted" />
        <CashbackChart expenses={expenses} />

        <div className="ed-dotted" />
        <Link href="/summary" className="ed-btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
          查 看 旅 程 總 結
        </Link>
      </div>
    </div>
  );
}
