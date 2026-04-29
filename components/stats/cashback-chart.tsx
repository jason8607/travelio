"use client";

import { useMemo } from "react";
import { useCreditCards } from "@/hooks/use-credit-cards";
import type { Expense } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CashbackChartProps {
  expenses: Expense[];
}

export function CashbackChart({ expenses }: CashbackChartProps) {
  const { cards, loading } = useCreditCards();

  const cardStats = useMemo(() => {
    if (cards.length === 0) return [];

    const creditExpenses = expenses.filter(
      (e) => e.payment_method === "信用卡"
    );

    return cards.map((card) => {
      const cardExpenses = creditExpenses.filter(
        (e) => e.credit_card_id === card.id
      );

      const hasPlans = card.plans && card.plans.length > 0;

      let planBreakdown: {
        planId: string;
        planName: string;
        rate: number;
        totalTwd: number;
        cashback: number;
      }[] = [];

      let totalCashback = 0;
      let totalTwd = 0;

      if (hasPlans) {
        planBreakdown = card.plans!.map((plan) => {
          const planExpenses = cardExpenses.filter(
            (e) => e.credit_card_plan_id === plan.id
          );
          const planTwd = planExpenses.reduce((s, e) => s + e.amount_twd, 0);
          const cashback = Math.round(planTwd * plan.cashback_rate / 100);
          return {
            planId: plan.id,
            planName: plan.name,
            rate: plan.cashback_rate,
            totalTwd: planTwd,
            cashback,
          };
        });

        const unplannedExpenses = cardExpenses.filter(
          (e) => !e.credit_card_plan_id
        );
        if (unplannedExpenses.length > 0) {
          const unplannedTwd = unplannedExpenses.reduce((s, e) => s + e.amount_twd, 0);
          planBreakdown.push({
            planId: "__unassigned__",
            planName: "未指定方案",
            rate: 0,
            totalTwd: unplannedTwd,
            cashback: 0,
          });
        }

        totalCashback = planBreakdown.reduce((s, p) => s + p.cashback, 0);
        totalTwd = cardExpenses.reduce((s, e) => s + e.amount_twd, 0);
      } else {
        totalTwd = cardExpenses.reduce((s, e) => s + e.amount_twd, 0);
        totalCashback = Math.round(totalTwd * card.cashback_rate / 100);
      }

      const progress = Math.min(
        (totalCashback / card.cashback_limit) * 100,
        100
      );
      const isMaxed = totalCashback >= card.cashback_limit;

      return {
        card,
        totalTwd,
        cashbackEarned: totalCashback,
        progress,
        isMaxed,
        txCount: cardExpenses.length,
        hasPlans,
        planBreakdown,
      };
    });
  }, [cards, expenses]);

  if (loading || cards.length === 0) return null;

  const unassigned = expenses.filter(
    (e) => e.payment_method === "信用卡" && !e.credit_card_id
  );

  return (
    <section>
      <div className="ed-section-head">
        <span className="lbl">信 用 卡 回 饋</span>
        <Link
          href="/settings"
          className="meta"
          style={{ textDecoration: "none" }}
        >
          MANAGE →
        </Link>
      </div>

      <div>
        {cardStats.map(({ card, totalTwd, cashbackEarned, progress, isMaxed, txCount, hasPlans, planBreakdown }) => (
          <div key={card.id} className="ed-cash-card">
            <div className="ed-cash-head">
              <span className="ed-cash-name">
                💳 {card.name}
                {!hasPlans && (
                  <span
                    className="ed-mono"
                    style={{ fontSize: 9, color: "var(--ed-muted)", letterSpacing: 1 }}
                  >
                    {card.cashback_rate}%
                  </span>
                )}
              </span>
              <span className={cn("ed-cash-amt", isMaxed && "maxed")}>
                NT${cashbackEarned.toLocaleString()}
                <span
                  className="ed-mono"
                  style={{ fontSize: 9, color: "var(--ed-muted)", letterSpacing: 1, marginLeft: 4 }}
                >
                  / {card.cashback_limit.toLocaleString()}
                </span>
              </span>
            </div>

            <div className="ed-cash-bar">
              <i
                className={cn(isMaxed && "maxed")}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="ed-cash-meta">
              <span>消費 NT${totalTwd.toLocaleString()} · {txCount} 筆</span>
              {isMaxed ? (
                <span style={{ color: "var(--ed-ink)", fontWeight: 700 }}>已達上限</span>
              ) : (
                <span>還差 NT${(card.cashback_limit - cashbackEarned).toLocaleString()}</span>
              )}
            </div>

            {hasPlans && planBreakdown.length > 0 && (
              <div className="ed-cash-plans">
                {planBreakdown
                  .filter((p) => p.totalTwd > 0)
                  .map((p) => (
                    <div key={p.planId} className="ed-cash-plan-row">
                      <span>
                        {p.planName}
                        {p.rate > 0 && <span style={{ marginLeft: 4 }}>· {p.rate}%</span>}
                      </span>
                      <span>
                        NT${p.totalTwd.toLocaleString()}
                        {p.cashback > 0 && (
                          <span className="gain">+{p.cashback.toLocaleString()}</span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {unassigned.length > 0 && (
        <div
          className="ed-mono"
          style={{
            marginTop: 12,
            padding: "8px 12px",
            border: "1px dashed var(--ed-vermillion)",
            color: "var(--ed-vermillion)",
            fontSize: 10,
            letterSpacing: 1,
          }}
        >
          有 {unassigned.length} 筆信用卡消費未指定卡片，不列入回饋計算
        </div>
      )}
    </section>
  );
}
