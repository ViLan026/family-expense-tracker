-- Chạy file này trong Supabase → SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      varchar(50) not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  title            varchar(200) not null,
  description      text,
  amount           bigint not null check (amount > 0),
  transaction_date date not null default current_date,
  created_at       timestamptz not null default now()
);

create index if not exists transactions_date_idx
  on public.transactions (transaction_date desc, created_at desc);
create index if not exists transactions_user_idx
  on public.transactions (user_id);

-- Bật RLS và KHÔNG tạo policy nào: anon key không đọc/ghi được gì.
-- Server dùng service role key (bỏ qua RLS) nên ứng dụng vẫn hoạt động.
alter table public.users enable row level security;
alter table public.transactions enable row level security;
