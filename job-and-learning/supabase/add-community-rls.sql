-- ============================================================
-- community_posts / community_comments RLS 정책 추가
-- Supabase Dashboard > SQL Editor > 붙여넣기 > Run
-- ============================================================

-- ── community_posts 테이블 (없으면 생성) ──────────────────────
create table if not exists community_posts (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  author_email text,
  board        text default '자유게시판',
  title        text not null,
  content      text,
  created_at   timestamptz default now()
);

-- ── community_comments 테이블 (없으면 생성) ───────────────────
create table if not exists community_comments (
  id         uuid default gen_random_uuid() primary key,
  post_id    uuid references community_posts(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

-- ── RLS 활성화 ────────────────────────────────────────────────
alter table community_posts    enable row level security;
alter table community_comments enable row level security;

-- ── community_posts 정책 ──────────────────────────────────────
drop policy if exists "community_posts_select_all"  on community_posts;
drop policy if exists "community_posts_insert_own"  on community_posts;
drop policy if exists "community_posts_delete_own"  on community_posts;

create policy "community_posts_select_all" on community_posts
  for select using (true);

create policy "community_posts_insert_own" on community_posts
  for insert with check (auth.uid() = user_id);

create policy "community_posts_delete_own" on community_posts
  for delete using (auth.uid() = user_id);

-- ── community_comments 정책 ───────────────────────────────────
drop policy if exists "community_comments_select_all"  on community_comments;
drop policy if exists "community_comments_insert_own"  on community_comments;
drop policy if exists "community_comments_delete_own"  on community_comments;

create policy "community_comments_select_all" on community_comments
  for select using (true);

create policy "community_comments_insert_own" on community_comments
  for insert with check (auth.uid() = user_id);

create policy "community_comments_delete_own" on community_comments
  for delete using (auth.uid() = user_id);

-- ── 확인 ─────────────────────────────────────────────────────
select '✅ community RLS 정책 적용 완료!' as status;
