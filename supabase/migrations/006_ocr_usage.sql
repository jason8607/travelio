create table if not exists ocr_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_ocr_usage_user_date on ocr_usage (user_id, created_at);

alter table ocr_usage enable row level security;
