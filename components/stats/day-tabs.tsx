"use client";

import { useMemo, useRef, useEffect } from "react";
import { cn, formatDateLabel, isPreTripDate } from "@/lib/utils";

export const PRE_TRIP_KEY = "__pre_trip__";

interface DayTabsProps {
  dates: string[];
  selected: string | null;
  onChange: (date: string | null) => void;
  tripStartDate?: string;
}

export function DayTabs({ dates, selected, onChange, tripStartDate }: DayTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const tabs = useMemo(() => {
    const hasPreTrip = tripStartDate && dates.some((d) => isPreTripDate(d, tripStartDate));
    const tripDates = tripStartDate ? dates.filter((d) => !isPreTripDate(d, tripStartDate)) : dates;
    const result: { key: string; label: string }[] = [];
    if (hasPreTrip) result.push({ key: PRE_TRIP_KEY, label: "行前" });
    for (const date of tripDates) {
      result.push({ key: date, label: formatDateLabel(date, tripStartDate) });
    }
    return result;
  }, [dates, tripStartDate]);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div ref={scrollRef} className="ed-day-tabs">
      <button
        ref={selected === null ? activeRef : undefined}
        onClick={() => onChange(null)}
        className={cn("ed-day-tab", selected === null && "on")}
      >
        ALL
      </button>
      {tabs.map((tab) => {
        const isActive = selected === tab.key;
        return (
          <button
            key={tab.key}
            ref={isActive ? activeRef : undefined}
            onClick={() => onChange(tab.key)}
            className={cn("ed-day-tab", isActive && "on")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
