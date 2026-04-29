"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ExpenseForm } from "@/components/expense/expense-form";
import { LoadingState } from "@/components/layout/loading-state";
import { useApp } from "@/lib/context";
import { getGuestExpenses } from "@/lib/guest-storage";
import { toast } from "sonner";
import type { Expense } from "@/types";

function ExpensePageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { isGuest } = useApp();
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;

    if (isGuest) {
      const found = getGuestExpenses().find((e) => e.id === editId) ?? null;
      setEditExpense(found);
      if (!found) toast.error("無法載入消費資料");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/expenses?id=${editId}`);
        if (cancelled) return;
        if (!res.ok) throw new Error("載入失敗");
        const data = await res.json();
        if (!cancelled) setEditExpense(data.expense);
      } catch {
        if (!cancelled) toast.error("無法載入消費資料");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchExpense();
    return () => { cancelled = true; };
  }, [editId, isGuest]);

  if (loading) {
    return <LoadingState />;
  }

  return <ExpenseForm editExpense={editExpense} />;
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ExpensePageContent />
    </Suspense>
  );
}
