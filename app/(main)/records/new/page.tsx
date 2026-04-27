"use client";

import { useCategories } from "@/hooks/use-categories";
import { useApp } from "@/lib/context";
import { FALLBACK_RATE, formatJPY, formatTWD, getExchangeRate } from "@/lib/exchange-rate";
import { addGuestExpense, getGuestExpenses, updateGuestExpense } from "@/lib/guest-storage";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Expense, PaymentMethod, SplitType } from "@/types";

const PAYMENTS: PaymentMethod[] = ["現金", "信用卡", "PayPay", "Suica"];

function NewExpenseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");

  const { isGuest, currentTrip, tripMembers } = useApp();
  const { categories } = useCategories();

  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(!!editId);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"JPY" | "TWD">("JPY");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("現金");
  const [splitType, setSplitType] = useState<SplitType>("personal");
  const [storeName, setStoreName] = useState("");
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [submitting, setSubmitting] = useState(false);

  // Load exchange rate
  useEffect(() => {
    getExchangeRate().then(setRate).catch(() => {});
  }, []);

  // Load expense for edit
  useEffect(() => {
    if (!editId) {
      // default category from first category
      if (categories.length > 0 && !category) setCategory(categories[0].value);
      return;
    }
    let cancelled = false;
    const load = async () => {
      if (isGuest) {
        const found = getGuestExpenses().find((e) => e.id === editId) ?? null;
        if (cancelled) return;
        if (!found) toast.error("無法載入消費資料");
        else hydrate(found);
        setEditExpense(found);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/expenses?id=${editId}`);
        if (cancelled) return;
        if (!res.ok) throw new Error("載入失敗");
        const data = await res.json();
        if (!cancelled && data.expense) {
          hydrate(data.expense);
          setEditExpense(data.expense);
        }
      } catch {
        if (!cancelled) toast.error("無法載入消費資料");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [editId, isGuest, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  function hydrate(e: Expense) {
    setTitle(e.title);
    setCurrency(e.input_currency);
    setAmount(
      e.input_currency === "TWD" ? String(e.amount_twd ?? "") : String(e.amount_jpy ?? ""),
    );
    setCategory(e.category);
    setPaymentMethod(e.payment_method);
    setSplitType(e.split_type);
    setStoreName(e.store_name ?? "");
  }

  // Default category once categories load
  useEffect(() => {
    if (!editId && !category && categories.length > 0) {
      setCategory(categories[0].value);
    }
  }, [editId, category, categories]);

  // Top-5 categories (icon grid) + remainder via dropdown — keep editorial 5-col grid clean
  const topCats = useMemo(() => categories.slice(0, 5), [categories]);

  const amountNum = Number(amount) || 0;
  const jpy = currency === "JPY" ? amountNum : Math.round(amountNum / rate);
  const twd = currency === "TWD" ? amountNum : Math.round(amountNum * rate);

  const canSubmit = title.trim() && amountNum > 0 && category && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!isGuest && !currentTrip) {
      toast.error("尚未建立旅程");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        amount_jpy: jpy,
        amount_twd: twd,
        exchange_rate: rate,
        category,
        payment_method: paymentMethod,
        store_name: storeName.trim() || null,
        location: null,
        expense_date: editExpense?.expense_date ?? format(new Date(), "yyyy-MM-dd"),
        split_type: splitType,
        input_currency: currency,
        note: editExpense?.note ?? null,
      };

      if (isGuest) {
        if (editId) {
          const updated = updateGuestExpense(editId, payload);
          if (!updated) throw new Error("更新失敗");
        } else {
          const added = addGuestExpense(payload);
          if (!added) throw new Error("新增失敗");
        }
      } else {
        const url = "/api/expenses";
        const method = editId ? "PUT" : "POST";
        const body = editId ? { id: editId, ...payload } : { trip_id: currentTrip?.id, ...payload };
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "儲存失敗");
      }
      toast.success(editId ? "已更新" : "已新增");
      router.push("/records");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "儲存失敗";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="ed-mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--ed-muted)" }}>
          LOADING…
        </p>
      </div>
    );
  }

  const memberCount = tripMembers?.length ?? 0;
  const showSplitMembers = !isGuest && memberCount > 1;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ paddingBottom: 110 }}>
        {/* NavBack */}
        <div
          style={{
            padding: "12px 24px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/records"
            className="ed-mono"
            style={{ fontSize: 10, letterSpacing: 2, color: "var(--ed-muted)", textDecoration: "none" }}
          >
            ← 取消
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="ed-mono"
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: canSubmit ? "var(--ed-vermillion)" : "var(--ed-muted)",
              fontWeight: 700,
              background: "transparent",
              border: 0,
              cursor: canSubmit ? "pointer" : "default",
            }}
          >
            儲存
          </button>
        </div>

        {/* PageTitle */}
        <div style={{ padding: "14px 24px 0" }}>
          <div className="ed-page-title-kicker">
            {editId ? "編 輯 消 費" : "新 增 一 筆"}
          </div>
          <div className="ed-page-title-h">
            {editId ? (
              <>
                修改
                <br />
                這筆記錄
              </>
            ) : (
              <>
                今天，
                <br />
                買了什麼？
              </>
            )}
          </div>
        </div>

        {/* Amount card */}
        <div className="ed-amount-display">
          <div className="ed-mono" style={{ fontSize: 10, letterSpacing: 3, opacity: 0.6 }}>
            金額
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span
              className="ed-serif"
              style={{ fontSize: 20, color: "var(--ed-vermillion-soft)" }}
            >
              {currency === "JPY" ? "¥" : "NT$"}
            </span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="ed-amount-big"
              style={{
                background: "transparent",
                border: 0,
                outline: 0,
                color: "var(--ed-paper)",
                width: "100%",
              }}
            />
          </div>
          <div className="ed-mono" style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>
            ≈ {currency === "JPY" ? formatTWD(twd) : formatJPY(jpy)}
          </div>

          {/* Currency toggle */}
          <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 4 }}>
            {(["JPY", "TWD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="ed-serif"
                style={{
                  fontSize: 10,
                  border: "1px solid var(--ed-vermillion-soft)",
                  background: currency === c ? "var(--ed-vermillion-soft)" : "transparent",
                  color: currency === c ? "var(--ed-ink)" : "var(--ed-vermillion-soft)",
                  padding: "2px 8px",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ padding: "22px 24px 0" }}>
          <div className="ed-kicker">品項</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：一蘭拉麵"
            className="ed-input-line"
            style={{ marginTop: 4 }}
          />
        </div>

        {/* Store (optional) */}
        <div style={{ padding: "18px 24px 0" }}>
          <div className="ed-kicker">店家／地點（選填）</div>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="例：澀谷店"
            className="ed-input-line"
            style={{ marginTop: 4, fontSize: 16 }}
          />
        </div>

        {/* Category grid */}
        <div style={{ padding: "22px 24px 0" }}>
          <div className="ed-kicker" style={{ marginBottom: 10 }}>
            分類
          </div>
          <div className="ed-cats">
            {topCats.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.value)}
                className={"ed-cat" + (category === c.value ? " on" : "")}
                type="button"
              >
                <span className="ed-cat-ic">{c.icon}</span>
                <span className="ed-cat-lb">{c.label}</span>
              </button>
            ))}
          </div>
          {categories.length > 5 ? (
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {categories.slice(5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.value)}
                  className={"ed-chip" + (category === c.value ? " on" : "")}
                  type="button"
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Payment method */}
        <div style={{ padding: "22px 24px 0" }}>
          <div className="ed-kicker" style={{ marginBottom: 10 }}>
            付款方式
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PAYMENTS.map((p) => (
              <button
                key={p}
                onClick={() => setPaymentMethod(p)}
                className={"ed-chip" + (paymentMethod === p ? " on" : "")}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Split */}
        <div style={{ padding: "22px 24px 0" }}>
          <div className="ed-kicker" style={{ marginBottom: 10 }}>
            分帳
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              onClick={() => setSplitType("personal")}
              className={"ed-chip" + (splitType === "personal" ? " on" : "")}
              type="button"
            >
              個人
            </button>
            {showSplitMembers ? (
              <button
                onClick={() => setSplitType("split")}
                className={"ed-chip" + (splitType === "split" ? " on" : "")}
                type="button"
              >
                均分 {memberCount} 人
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom submit button */}
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 28,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="ed-btn-primary"
          style={{
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? "pointer" : "default",
          }}
        >
          {submitting ? "儲存中…" : editId ? "更　新　→" : "記　　錄　→"}
        </button>
      </div>
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p
            className="ed-mono"
            style={{ fontSize: 11, letterSpacing: 2, color: "var(--ed-muted)" }}
          >
            LOADING…
          </p>
        </div>
      }
    >
      <NewExpenseInner />
    </Suspense>
  );
}
