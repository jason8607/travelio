"use client";

import { useRef, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

interface DayTabsProps {
  dates: string[];
  selected: string | null;
  onChange: (date: string | null) => void;
}

export function DayTabs({ dates, selected, onChange }: DayTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4"
    >
      <button
        ref={selected === null ? activeRef : undefined}
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
          selected === null
            ? "bg-slate-800 text-white shadow-sm"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        )}
      >
        全部
      </button>
      {dates.map((date) => {
        const d = parseISO(date);
        const label = `${format(d, "M/d")}(${DAY_LABELS[d.getDay()]})`;
        const isActive = selected === date;
        return (
          <button
            key={date}
            ref={isActive ? activeRef : undefined}
            onClick={() => onChange(date)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
              isActive
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
