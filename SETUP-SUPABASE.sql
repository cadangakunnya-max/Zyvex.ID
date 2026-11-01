-- Jalankan seluruh SQL ini di Supabase SQL Editor.
-- Membuat tabel listing akun dan daftar admin yang aman dengan RLS.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  account_code text unique default ('ZYVEX-' || upper(substr(gen_random_uuid()::text,1,8))),
  title text not null,
  game text not null default 'Mobile Legends',
  rank text,
  level integer default 1,
  skins integer default 0,
  price numeric(15,2) not null default 0,
  description text,
  image_url text,
  contact_whatsapp text,
  status text not null default 'available'
    check (status in ('available','reserved','sold')),
  dp_enabled boolean not null default false,
  dp_amount numeric(15,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
alter table public.admin_users enable row level security;

-- Fungsi pengecekan admin. SECURITY DEFINER agar policy accounts dapat
-- memeriksa admin_users tanpa memberi akses publik ke daftar admin.
create or replace function public.is_zyvex_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_zyvex_admin() from public;
grant execute on function public.is_zyvex_admin() to authenticated;

drop policy if exists "Public can view available accounts" on public.accounts;
create policy "Public can view available accounts"
on public.accounts for select to anon, authenticated
using (status = 'available' or (select public.is_zyvex_admin()));

drop policy if exists "Admins can insert accounts" on public.accounts;
create policy "Admins can insert accounts"
on public.accounts for insert to authenticated
with check ((select public.is_zyvex_admin()));

drop policy if exists "Admins can update accounts" on public.accounts;
create policy "Admins can update accounts"
on public.accounts for update to authenticated
using ((select public.is_zyvex_admin()))
with check ((select public.is_zyvex_admin()));

drop policy if exists "Admins can delete accounts" on public.accounts;
create policy "Admins can delete accounts"
on public.accounts for delete to authenticated
using ((select public.is_zyvex_admin()));

-- Tidak ada policy SELECT/INSERT/UPDATE/DELETE untuk anon pada admin_users.
-- Daftarkan admin setelah membuat user Auth:
-- 1) Authentication > Users > Add user (buat email/password admin).
-- 2) Salin UUID user tersebut.
-- 3) Ganti UUID_DI_SINI pada query berikut dan jalankan:
-- insert into public.admin_users (user_id)
-- values ('UUID_DI_SINI')
-- on conflict (user_id) do nothing;
