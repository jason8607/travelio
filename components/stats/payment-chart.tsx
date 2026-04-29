"use client";

import { formatJPY } from "@/lib/exchange-rate";
import type { Expense } from "@/types";
import { PAYMENT_METHODS } from "@/types";
import { PaymentIcon } from "@/components/expense/payment-icon";

interface PaymentChartProps {
  expenses: Expense[];
  title?: string;
}

const BAR_TOTAL = 12;

export function PaymentChart({ expenses, title = "支 付 方 式" }: PaymentChartProps) {
  const total = expenses.reduce((s, e) => s + e.amount_jpy, 0);
  if (total === 0) return null;

  const data = PAYMENT_METHODS.map((pm) => {
    const amount = expenses
      .filter((e) => e.payment_method === pm.value)
      .reduce((s, e) => s + e.amount_jpy, 0);
    return {
      name: pm.label,
      method: pm.value,
      value: amount,
      percentage: Math.round((amount / total) * 100),
    };
  })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;

  return (
    <section>
      <div className="ed-section-head">
        <span className="lbl">{title}</span>
        <span className="meta">PAYMENT · {data.length} 種</span>
      </div>
      <div>
        {data.map((item) => {
          const filled = Math.max(1, Math.round((item.percentage / 100) * BAR_TOTAL));
          const empty = BAR_TOTAL - filled;
          return (
            <div key={item.name} className="ed-cat-bar-row">
              <div className="ed-cat-bar-line">
                <span className="lb inline-flex items-center gap-1.5">
                  <PaymentIcon method={item.method} size={14} />
                  {item.name}
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
