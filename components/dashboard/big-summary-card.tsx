"use client";

import Link from "next/link";
import { formatJPY, formatTWD } from "@/lib/exchange-rate";
import { cn } from "@/lib/utils";

interface BigSummaryCardProps {
  totalJpy: number;
  totalTwd: number;
  count: number;
  budgetJpy?: number | null;
}

export function BigSummaryCard({
  totalJpy,
  totalTwd,
  count,
  budgetJpy,
}: BigSummaryCardProps) {
  const hasBudget = !!budgetJpy && budgetJpy > 0;
  const percentage = hasBudget
    ? Math.min(Math.round((totalJpy / budgetJpy!) * 100), 100)
    : 0;
  const isOver = hasBudget && totalJpy > budgetJpy!;

  return (
    <Link href="/records" className="block mx-4">
      <div className="rounded-3xl bg-card p-5 shadow-sm border border-border/60">
        <p className="text-xs text-muted-foreground font-medium">旅程總支出</p>
        <p className="text-[2rem] leading-tight font-bold tracking-tight mt-1 text-foreground">
          {formatJPY(totalJpy)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ≈ {formatTWD(totalTwd)} · {count} 筆
        </p>

        {hasBudget && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">
                預算 {formatJPY(budgetJpy!)}
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  isOver ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isOver
                    ? "bg-linear-to-r from-red-400 to-red-500"
                    : percentage > 80
                      ? "bg-linear-to-r from-amber-400 to-orange-500"
                      : "bg-linear-to-r from-rose-300 to-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
