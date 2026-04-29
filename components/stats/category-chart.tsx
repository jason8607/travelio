"use client";

import { formatJPY } from "@/lib/exchange-rate";
import type { Expense } from "@/types";
import { useCategories } from "@/hooks/use-categories";

interface CategoryChartProps {
  expenses: Expense[];
  title?: string;
}

const BAR_TOTAL = 12;

export function CategoryChart({ expenses, title = "各 類 別" }: CategoryChartProps) {
  const { categories } = useCategories();
  const total = expenses.reduce((s, e) => s + e.amount_jpy, 0);
  if (total === 0) return null;

  const knownValues = new Set(categories.map((c) => c.value));

  const data = categories.map((cat) => {
    const amount = expenses
      .filter((e) => e.category === cat.value)
      .reduce((s, e) => s + e.amount_jpy, 0);
    return {
      name: cat.label,
      icon: cat.icon,
      value: amount,
      percentage: Math.round((amount / total) * 100),
    };
  });

  const unknownAmount = expenses
    .filter((e) => !knownValues.has(e.category))
    .reduce((s, e) => s + e.amount_jpy, 0);
  if (unknownAmount > 0) {
    data.push({
      name: "其他",
      icon: "📦",
      value: unknownAmount,
      percentage: Math.round((unknownAmount / total) * 100),
    });
  }

  const filtered = data
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (filtered.length === 0) return null;

  return (
    <section>
      <div className="ed-section-head">
        <span className="lbl">{title}</span>
        <span className="meta">CATEGORY · {filtered.length} 類</span>
      </div>
      <div>
        {filtered.map((item) => {
          const filled = Math.max(1, Math.round((item.percentage / 100) * BAR_TOTAL));
          const empty = BAR_TOTAL - filled;
          return (
            <div key={item.name} className="ed-cat-bar-row">
              <div className="ed-cat-bar-line">
                <span className="lb">
                  {item.icon} {item.name}
                </span>
                <span className="am">{formatJPY(item.value)}</span>
              </div>
              <div className="ed-cat-bar-blocks">
                <span className="filled">{"█".repeat(filled)}</span>
                <span className="empty">{"░".repeat(empty)}</span>
                <span className="pct">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
