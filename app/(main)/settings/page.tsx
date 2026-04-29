"use client";

import { CategoryManager } from "@/components/settings/category-manager";
import { CreditCardManager } from "@/components/settings/credit-card-manager";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useApp } from "@/lib/context";
import { updateGuestTrip } from "@/lib/guest-storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile, Trip, TripMember } from "@/types";
import { format } from "date-fns";
import {
  Check,
  Copy,
  LogOut,
  Pencil,
  Plane,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    user,
    profile,
    trips,
    currentTrip,
    tripMembers,
    isGuest,
    setCurrentTrip,
    exitGuestMode,
    refreshProfile,
    refreshTrips,
    refreshTrip,
    loading: ctxLoading,
  } = useApp();
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji || "🧑");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [saving, setSaving] = useState(false);

  const [editingTrip, setEditingTrip] = useState(false);
  const [tripName, setTripName] = useState("");
  const [tripStart, setTripStart] = useState("");
  const [tripEnd, setTripEnd] = useState("");
  const [tripBudget, setTripBudget] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [members, setMembers] = useState<(TripMember & { profile?: Profile })[]>([]);

  const [removeTarget, setRemoveTarget] = useState<{ userId: string; name: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarEmoji(profile.avatar_emoji || "🧑");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  useEffect(() => {
    if (currentTrip) {
      setTripName(currentTrip.name);
      setTripStart(currentTrip.start_date);
      setTripEnd(currentTrip.end_date);
      setTripBudget(currentTrip.budget_jpy?.toString() || "");
      if (!isGuest) loadMembers(currentTrip.id);
    }
  }, [currentTrip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMembers = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trip-members?trip_id=${tripId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.members && currentTrip?.id === tripId) setMembers(data.members);
      }
    } catch {
      // ignore
    }
  };

  const handleSwitchTrip = (trip: Trip) => {
    setCurrentTrip(trip);
    setEditingTrip(false);
    setShowInvite(false);
    toast.success(`已切換至「${trip.name}」`);
  };

  const handleUploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上傳失敗");
      return data.avatarUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "上傳失敗";
      toast.error(message);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        avatar_emoji: avatarEmoji,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("更新失敗");
    } else {
      toast.success("個人資料已更新");
      await refreshProfile();
      await refreshTrip();
      if (currentTrip) loadMembers(currentTrip.id);
    }
    setSaving(false);
  };

  const handleSaveTrip = async () => {
    if (!currentTrip) return;
    setSaving(true);
    try {
      const res = await fetch("/api/trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentTrip.id,
          name: tripName,
          start_date: tripStart,
          end_date: tripEnd,
          budget_jpy: tripBudget ? Number(tripBudget) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新失敗");
      setCurrentTrip(data.trip);
      await refreshTrips();
      setEditingTrip(false);
      toast.success("旅程已更新");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "更新失敗";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentTrip) return;
    setInviting(true);
    try {
      const res = await fetch("/api/trip-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_id: currentTrip.id, email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "邀請失敗");
      } else {
        toast.success("已邀請成員加入");
        setInviteEmail("");
        if (currentTrip) loadMembers(currentTrip.id);
        await refreshTrip();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "邀請失敗";
      toast.error(message);
    } finally {
      setInviting(false);
    }
  };

  const isOwner = members.some(
    (m) => m.user_id === user?.id && m.role === "owner"
  ) || tripMembers.some(
    (m) => m.user_id === user?.id && m.role === "owner"
  );

  const handleRemoveMember = async () => {
    if (!currentTrip || !removeTarget) return;
    const { userId: targetUserId, name: targetName } = removeTarget;
    setRemoveTarget(null);
    try {
      const res = await fetch("/api/trip-members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: currentTrip.id,
          user_id: targetUserId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "移除失敗");
      toast.success(`已移除「${targetName}」`);
      if (currentTrip) loadMembers(currentTrip.id);
      await refreshTrip();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "移除失敗";
      toast.error(message);
    }
  };

  const handleCopyLink = async () => {
    if (!currentTrip) return;
    const link = `${window.location.origin}/trip/${currentTrip.id}/join`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("邀請連結已複製");
    } catch {
      toast.error("複製失敗，請手動複製連結");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleSaveGuestTrip = () => {
    if (!currentTrip) return;
    setSaving(true);
    const updated = updateGuestTrip({
      name: tripName,
      start_date: tripStart,
      end_date: tripEnd,
      budget_jpy: tripBudget ? Number(tripBudget) : null,
    });
    if (!updated) {
      setSaving(false);
      toast.error("結束日期不能早於開始日期");
      return;
    }
    setCurrentTrip(updated);
    setEditingTrip(false);
    setSaving(false);
    toast.success("旅程已更新");
  };

  if (ctxLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="ed-mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--ed-muted)" }}>
          LOADING…
        </p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ padding: 24 }}>
        <Link href="/auth/login" className="ed-btn-primary" style={{ display: "inline-block", padding: "12px 28px", textDecoration: "none" }}>
          請 先 登 入
        </Link>
      </div>
    );
  }

  const today = new Date();
  const issueNo = currentTrip ? String(currentTrip.id).slice(-2).padStart(2, "0").toUpperCase() : "—";

  const tripEditor = (
    <div style={{ padding: "12px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="ed-set-label">TRIP NAME · 旅程名稱</label>
          <input
            className="ed-set-input"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="ed-set-label">START</label>
            <input
              type="date"
              className="ed-set-input"
              value={tripStart}
              onChange={(e) => setTripStart(e.target.value)}
            />
          </div>
          <div>
            <label className="ed-set-label">END</label>
            <input
              type="date"
              className="ed-set-input"
              value={tripEnd}
              onChange={(e) => setTripEnd(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="ed-set-label">BUDGET · 預算（¥）</label>
          <input
            type="number"
            className="ed-set-input"
            value={tripBudget}
            onChange={(e) => setTripBudget(e.target.value)}
            placeholder="選填"
          />
        </div>
        <button
          onClick={isGuest ? handleSaveGuestTrip : handleSaveTrip}
          className="ed-btn-primary"
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "儲 存 中…" : "儲 存 變 更"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Editorial header */}
      <div className="ed-runhdr">
        <span>SETTINGS — N°{issueNo}</span>
        <span>{format(today, "yyyy.MM.dd")}</span>
      </div>
      <div className="ed-rule" />
      <div className="ed-rule2" />

      {/* PageTitle */}
      <div style={{ padding: "14px 24px 0" }}>
        <div className="ed-page-title-kicker">設 定</div>
        <div className="ed-page-title-h">
          {isGuest ? (
            <>
              試用模式
              <br />
              偏好<span className="ed-page-title-dot">.</span>
            </>
          ) : (
            <>
              個人偏好
              <br />
              與旅程<span className="ed-page-title-dot">.</span>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* ===== Trip switcher (auth only) ===== */}
        {!isGuest && (
          <div className="ed-set-group">
            <div className="ed-set-group-head">
              <span className="ed-set-group-title">
                <Plane className="h-4 w-4" />
                我 的 旅 程
              </span>
            </div>
            <div>
              {trips.map((trip) => {
                const isActive = trip.id === currentTrip?.id;
                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => handleSwitchTrip(trip)}
                    className={cn("ed-set-row", isActive && "on")}
                  >
                    <div className="pri">
                      <div className={cn("ttl", isActive && "on")}>{trip.name}</div>
                      <div className="sub">
                        {trip.start_date} ~ {trip.end_date}
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4" style={{ color: "var(--ed-vermillion)" }} />}
                  </button>
                );
              })}
              <Link
                href="/trip/new"
                className="ed-set-row"
                style={{ justifyContent: "center", color: "var(--ed-vermillion)", fontFamily: "var(--font-shippori), serif", fontSize: 13, letterSpacing: 4, textDecoration: "none" }}
              >
                ＋ 建 立 新 旅 程
              </Link>
            </div>
          </div>
        )}

        {/* ===== Current trip ===== */}
        {currentTrip && (
          <div className="ed-set-group">
            <div className="ed-set-group-head">
              <span className="ed-set-group-title">
                {isGuest ? "試 用 旅 程" : "旅 程 設 定"}
              </span>
              {!editingTrip ? (
                <button onClick={() => setEditingTrip(true)} className="ed-set-group-action">
                  <Pencil className="h-3 w-3" />
                  編輯
                </button>
              ) : (
                <button onClick={() => setEditingTrip(false)} className="ed-set-group-action" style={{ color: "var(--ed-muted)" }}>
                  <X className="h-3 w-3" />
                  取消
                </button>
              )}
            </div>

            {editingTrip ? (
              tripEditor
            ) : (
              <div style={{ padding: "12px 14px" }}>
                <div className="ed-serif" style={{ fontSize: 16, fontWeight: 700, color: "var(--ed-ink)" }}>
                  {currentTrip.name}
                </div>
                <div
                  className="ed-mono"
                  style={{ fontSize: 10, letterSpacing: 1, color: "var(--ed-muted)", marginTop: 4 }}
                >
                  {currentTrip.start_date} ~ {currentTrip.end_date}
                  {currentTrip.budget_jpy != null && (
                    <> · 總預算 ¥{currentTrip.budget_jpy.toLocaleString()}</>
                  )}
                </div>
              </div>
            )}

            {/* Members (auth only) */}
            {!isGuest && (
              <div style={{ borderTop: "1px solid var(--ed-line)" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="ed-mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--ed-muted)" }}>
                    成員 · {members.length || tripMembers.length}
                  </span>
                  <button onClick={() => setShowInvite(!showInvite)} className="ed-set-group-action">
                    <UserPlus className="h-3 w-3" />
                    {showInvite ? "收起" : "邀請"}
                  </button>
                </div>
                <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {(members.length > 0 ? members : tripMembers).map((m) => (
                    <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <UserAvatar avatarUrl={m.profile?.avatar_url} avatarEmoji={m.profile?.avatar_emoji} size="sm" />
                      <span className="ed-serif" style={{ flex: 1, fontSize: 13, color: "var(--ed-ink)" }}>
                        {m.profile?.display_name || "成員"}
                      </span>
                      <span className="ed-mono" style={{ fontSize: 9, letterSpacing: 1, color: m.role === "owner" ? "var(--ed-vermillion)" : "var(--ed-muted)" }}>
                        {m.role === "owner" ? "OWNER" : "MEMBER"}
                      </span>
                      {isOwner && m.role !== "owner" && (
                        <button
                          onClick={() => setRemoveTarget({ userId: m.user_id, name: m.profile?.display_name || "成員" })}
                          aria-label={`移除${m.profile?.display_name || "成員"}`}
                          style={{ padding: 2, color: "var(--ed-muted)", background: "transparent", border: 0 }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {showInvite && (
                  <div style={{ borderTop: "1px solid var(--ed-line)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <form onSubmit={handleInvite} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label className="ed-set-label">EMAIL</label>
                        <input
                          type="email"
                          className="ed-set-input"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="對方的 Email"
                        />
                      </div>
                      <button
                        type="submit"
                        className="ed-mono"
                        style={{
                          padding: "8px 14px",
                          background: "var(--ed-vermillion)",
                          color: "var(--ed-paper)",
                          border: 0,
                          fontSize: 11,
                          letterSpacing: 3,
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                        disabled={inviting}
                      >
                        {inviting ? "…" : "邀請"}
                      </button>
                    </form>
                    <button onClick={handleCopyLink} className="ed-set-link">
                      <Copy className="h-3 w-3" />
                      複 製 邀 請 連 結
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== Credit cards / categories ===== */}
        <CreditCardManager />
        <CategoryManager />

        {/* ===== Profile (auth only) ===== */}
        {!isGuest && (
          <div className="ed-set-group">
            <div className="ed-set-group-head">
              <span className="ed-set-group-title">
                <User className="h-4 w-4" />
                個 人 資 料
              </span>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AvatarPicker
                  avatarUrl={avatarUrl}
                  avatarEmoji={avatarEmoji}
                  onChangeEmoji={setAvatarEmoji}
                  onChangeUrl={setAvatarUrl}
                  onUpload={handleUploadAvatar}
                />
                <div style={{ flex: 1 }}>
                  <label className="ed-set-label">NICKNAME · 暱稱</label>
                  <input
                    className="ed-set-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="你的暱稱"
                    maxLength={50}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                className="ed-btn-primary"
                disabled={saving}
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                儲 存 個 人 資 料
              </button>
            </div>
          </div>
        )}

        {/* ===== Guest signup CTA ===== */}
        {isGuest && (
          <div
            className="ed-set-group"
            style={{ borderColor: "var(--ed-vermillion)", marginTop: 24 }}
          >
            <div style={{ padding: "16px 14px", textAlign: "center" }}>
              <div
                className="ed-serif"
                style={{ fontSize: 15, color: "var(--ed-ink)", fontWeight: 600, lineHeight: 1.5 }}
              >
                登入後可永久保存資料、
                <br />
                多人分帳、AI 收據辨識
              </div>
              <Link
                href="/auth/login"
                className="ed-btn-primary"
                style={{ display: "inline-block", marginTop: 14, padding: "12px 28px", textDecoration: "none" }}
              >
                登 入 ／ 註 冊
              </Link>
            </div>
          </div>
        )}

        {/* ===== Logout / exit guest ===== */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px dashed var(--ed-line)" }}>
          {isGuest ? (
            <button
              onClick={() => { exitGuestMode(); router.push("/"); }}
              className="ed-btn-ghost"
              style={{ width: "100%", padding: "12px 0", fontSize: 14, letterSpacing: 6, color: "var(--ed-vermillion)", borderColor: "var(--ed-vermillion)" }}
            >
              <LogOut className="h-4 w-4 inline -mt-0.5 mr-2" />
              結 束 試 用
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="ed-btn-ghost"
              style={{ width: "100%", padding: "12px 0", fontSize: 14, letterSpacing: 6, color: "var(--ed-vermillion)", borderColor: "var(--ed-vermillion)" }}
            >
              <LogOut className="h-4 w-4 inline -mt-0.5 mr-2" />
              登 出
            </button>
          )}
        </div>
      </div>

      <Dialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>確定要移除成員？</DialogTitle>
            <DialogDescription>
              將移除「{removeTarget?.name}」，該成員的消費紀錄會轉移給建立者。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setRemoveTarget(null)} className="ed-btn-ghost" style={{ padding: "8px 18px", fontSize: 13, letterSpacing: 4 }}>
              取 消
            </button>
            <button
              onClick={handleRemoveMember}
              className="ed-btn-primary"
              style={{ width: "auto", padding: "8px 18px", fontSize: 13, letterSpacing: 4 }}
            >
              確 定 移 除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
