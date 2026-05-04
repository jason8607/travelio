"use client";

import { useState } from "react";
import { Trash2, Users, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatJPY, formatTWD } from "@/lib/exchange-rate";
import { DEFAULT_CATEGORIES } from "@/types";
import type { Expense, CategoryItem } from "@/types";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => Promise<void>;
  categories?: CategoryItem[];
}

const FALLBACK_CATEGORY = DEFAULT_CATEGORIES.find((c) => c.value === "其他") ?? DEFAULT_CATEGORIES[0];

export function ExpenseCard({ expense, onDelete, categories = DEFAULT_CATEGORIES }: ExpenseCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const categoryInfo = categories.find((c) => c.value === expense.category);
  const categoryColor = categoryInfo?.color ?? FALLBACK_CATEGORY.color;
  const categoryIcon = categoryInfo?.icon ?? FALLBACK_CATEGORY.icon;

  return (
    <div className="relative flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl ring-1 ring-foreground/10 transition-colors">
      <Link
        href={`/records/new?edit=${expense.id}`}
        aria-label={`編輯消費：${expense.title}`}
        className="absolute inset-0 rounded-xl z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      />

      <UserAvatar
        avatarUrl={expense.profile?.avatar_url}
        avatarEmoji={expense.profile?.avatar_emoji}
        size="md"
      />

      <div className="flex-1 min-w-0 pointer-events-none">
        <p className="font-semibold text-sm text-foreground truncate">{expense.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-[18px] gap-0.5 font-medium"
            style={{
              backgroundColor: `${categoryColor}18`,
              color: categoryColor,
            }}
          >
            {categoryIcon} {expense.category}
          </Badge>
          {expense.split_type === "split" && (
            <Users className="h-3 w-3 text-muted-foreground" aria-label="均分" />
          )}
        </div>
      </div>

      <div className="shrink-0 text-right pointer-events-none">
        <p className="font-bold text-sm text-foreground tabular-nums">
          {formatJPY(expense.amount_jpy)}
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {formatTWD(expense.amount_twd)}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-0.5 relative z-10">
        {expense.receipt_image_url && (
          <button
            type="button"
            aria-label="檢視收據"
            onClick={(e) => {
              e.stopPropagation();
              setShowReceipt(true);
            }}
            className="min-h-11 min-w-11 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            aria-label="刪除消費"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            disabled={deleting}
            className="min-h-11 min-w-11 flex items-center justify-center text-muted-foreground/60 hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {expense.receipt_image_url && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-sm p-2">
            <DialogHeader>
              <DialogTitle className="text-sm">收據照片</DialogTitle>
              <DialogDescription className="sr-only">收據照片預覽</DialogDescription>
            </DialogHeader>
            <div className="relative w-full aspect-3/4 rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expense.receipt_image_url}
                alt="收據照片"
                className="w-full h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>確定要刪除？</DialogTitle>
            <DialogDescription>刪除後無法復原</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                setShowDeleteDialog(false);
                setDeleting(true);
                await onDelete!(expense.id);
                setDeleting(false);
              }}
            >
              確定刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
