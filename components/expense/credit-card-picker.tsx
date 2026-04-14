"use client";

import { useCreditCards } from "@/hooks/use-credit-cards";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import Link from "next/link";

interface CreditCardPickerProps {
  value: string | null;
  onChange: (cardId: string | null) => void;
  planValue?: string | null;
  onPlanChange?: (planId: string | null) => void;
}

export function CreditCardPicker({ value, onChange, planValue, onPlanChange }: CreditCardPickerProps) {
  const { cards, loading } = useCreditCards();

  if (loading) return null;

  if (cards.length === 0) {
    return (
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex items-center justify-between">
        <p className="text-xs text-blue-600">尚未設定信用卡</p>
        <Link
          href="/settings"
          className="text-xs text-blue-500 font-medium flex items-center gap-1 hover:underline"
        >
          <Settings className="h-3 w-3" />
          前往設定
        </Link>
      </div>
    );
  }

  const selectedCard = cards.find((c) => c.id === value);
  const hasPlans = selectedCard?.plans && selectedCard.plans.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {cards.map((card) => {
          const isSelected = value === card.id;
          const displayRate =
            card.plans && card.plans.length > 0
              ? (() => {
                  const rates = card.plans.map((p) => p.cashback_rate);
                  const min = Math.min(...rates);
                  const max = Math.max(...rates);
                  return min === max ? `${min}%` : `${min}~${max}%`;
                })()
              : `${card.cashback_rate}%`;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onChange(null);
                  onPlanChange?.(null);
                } else {
                  onChange(card.id);
                  // Auto-select first plan if card has plans
                  if (card.plans && card.plans.length > 0) {
                    onPlanChange?.(card.plans[0].id);
                  } else {
                    onPlanChange?.(null);
                  }
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-all duration-200 text-sm",
                isSelected
                  ? "border-blue-400 bg-blue-50 text-blue-700 font-medium"
                  : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <span className="text-base leading-none">💳</span>
              <span className="leading-none">{card.name}</span>
              <span className="text-[10px] text-slate-400 leading-none self-center">
                {displayRate}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plan selection */}
      {hasPlans && (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {selectedCard!.plans!.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onPlanChange?.(plan.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg border transition-all duration-200 text-xs",
                planValue === plan.id
                  ? "border-teal-400 bg-teal-50 text-teal-700 font-medium"
                  : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {plan.name}
              <span className="ml-1 text-[10px] opacity-70">{plan.cashback_rate}%</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
