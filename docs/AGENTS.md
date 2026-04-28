# Agent Workflow (Strict)

## Execution
1. Read PLAN.md
2. Work on current task ONLY
3. Update PLAN.md after completion
4. Keep output concise

## Context Control
- Do NOT scan entire repo
- Only read necessary files
- Do NOT re-analyze completed work
- Do NOT repeat explanations
- If unclear, ask before proceeding

## Safety
- Do NOT make assumptions about missing context
- Do NOT explore beyond task scope

---

# Project Rules（專案規則）

## 語言
- UI text: Traditional Chinese
- Code & comments: English

## 資料存取
- Always use Supabase admin client (service role)
- Never access database directly from frontend

## 模式
- Guest → localStorage  
  (lib/guest-storage.ts, lib/credit-cards.ts)
- Auth → Supabase API

## DB 變更（重要）
When adding a new column, MUST update:
- types/index.ts
- API route
- guest-storage (if applicable)
- related UI components

## Migration
- Continue from latest version (current: 016)
- No duplicate or skipped numbers

## RLS Policy
Must include:
- select
- insert
- update
- delete

## 信用卡方案（重要）
- Use upsert (keep plan ID)
- Do NOT delete + reinsert