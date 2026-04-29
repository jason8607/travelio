"use client";

import { formatJPY } from "@/lib/exchange-rate";
import type { Expense } from "@/types";

interface TopExpensesProps {
  expenses: Expense[];
  title?: string;
  limit?: number;
}

export function TopExpenses({ expenses, title = "花 費 排 名", limit = 5 }: TopExpensesProps) {
  const sorted = [...expenses]
    .sort((a, b) => b.amount_jpy - a.amount_jpy)
    .slice(0, limit);

  if (sorted.length === 0) return null;

  return (
    <section>
      <div className="ed-section-head">
        <span className="lbl">{title}</span>
        <span className="meta">TOP {sorted.length}</span>
      </div>
      <div>
        {sorted.map((expense, index) => (
          <div key={expense.id} className="ed-top-row">
            <span className="num">{String(index + 1).padStart(2, "0")}</span>
            <div className="info">
              <div className="ttl">{expense.title}</div>
              <div className="meta">
                {expense.expense_date}
                {expense.category ? ` · ${expense.category}` : ""}
              </div>
            </div>
            <div className="amt">{formatJPY(expense.amount_jpy)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
