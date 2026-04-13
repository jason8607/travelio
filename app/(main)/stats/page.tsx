"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/context";
import { useExpenses } from "@/hooks/use-expenses";
import { CategoryChart } from "@/components/stats/category-chart";
import { PaymentChart } from "@/components/stats/payment-chart";
import { TopExpenses } from "@/components/stats/top-expenses";
import { CashbackChart } from "@/components/stats/cashback-chart";
import { DayTabs } from "@/components/stats/day-tabs";
import { formatJPY, formatTWD } from "@/lib/exchange-rate";
import { parseISO, format } from "date-fns";

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export default function StatsPage() {
  const { currentTrip, loading: ctxLoading } = useApp();
  const { expenses, loading } = useExpenses();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dates = useMemo(() => {
    const set = new Set(expenses.map((e) => e.expense_date));
    return [...set].sort();
  }, [expenses]);

  const filtered = useMemo(
    () =>
      selectedDate
        ? expenses.filter((e) => e.expense_date === selectedDate)
        : expenses,
    [expenses, selectedDate]
  );

  const totalJpy = filtered.reduce((s, e) => s + e.amount_jpy, 0);
  const totalTwd = filtered.reduce((s, e) => s + e.amount_twd, 0);

  if (loading || ctxLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <p className="text-4xl mb-2">📊</p>
        <p className="text-sm">請先建立旅程</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <p className="text-4xl mb-2">📊</p>
        <p className="text-sm">還沒有消費紀錄，統計數據會在這裡顯示</p>
      </div>
    );
  }

  const dateLabel = selectedDate
    ? (() => {
        const d = parseISO(selectedDate);
        return `${format(d, "M/d")}(${DAY_LABELS[d.getDay()]})`;
      })()
    : null;

  return (
    <div className="space-y-4 p-4 pb-4">
      <DayTabs dates={dates} selected={selectedDate} onChange={setSelectedDate} />

      <div className="rounded-2xl border bg-white p-4 shadow-sm text-center">
        <p className="text-xs text-muted-foreground mb-1">
          {dateLabel ? `${dateLabel} 花費` : "全部花費"}
        </p>
        <p className="text-2xl font-bold">{formatJPY(totalJpy)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          ≈ {formatTWD(totalTwd)} · {filtered.length} 筆
        </p>
      </div>

      <CategoryChart
        expenses={filtered}
        title={dateLabel ? `${dateLabel} 分類支出` : "分類支出"}
      />

      <PaymentChart
        expenses={filtered}
        title={dateLabel ? `${dateLabel} 支付方式` : "支付方式"}
      />

      <TopExpenses
        expenses={filtered}
        title={dateLabel ? `${dateLabel} 花費排名` : "花費排名"}
      />

      <CashbackChart expenses={expenses} />
    </div>
  );
}
