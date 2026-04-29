"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function PageHeader({
  title,
  showBack,
  right,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="shrink-0 border-b bg-card">
      <div className="relative flex h-14 items-center justify-center px-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="返回上一頁"
            className="absolute left-4 flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors"
          >
            <span aria-hidden="true" className="text-lg leading-none">←</span>
            <span>返回</span>
          </button>
        )}
        <div className="min-w-0 max-w-[calc(100%-6rem)] text-center">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {right && <div className="absolute right-4">{right}</div>}
      </div>
    </header>
  );
}
