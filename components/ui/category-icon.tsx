"use client";

import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-sm",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

export function CategoryIcon({
  icon,
  color,
  size = "md",
  className,
}: CategoryIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: `${color}26` }}
    >
      <span className="leading-none">{icon}</span>
    </div>
  );
}
