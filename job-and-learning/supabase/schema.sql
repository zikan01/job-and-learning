-- ============================================================
-- Job and Learning (잡앤러닝) — Supabase Schema v2
-- Supabase Dashboard > SQL Editor > 전체 붙여넣기 > Run
-- 여러 번 실행해도 안전 (idempotent)
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text,
  avatar_url  text,
  nationality text,
  university  text,
  created_at  timestamptz default now()
);

create table if not exists jobs (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  company     text not null,
  hourly_wage integer not null,
  location    text not null,
  deadline    date,
  description text,
  category    text default '서비스업',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create table if not exists applications (
  id         uuid default gen_random_uuid() primary key,
  job_id     uuid references jobs(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  status     text default 'pending',
  created_at timestamptz default now(),
  unique(job_id, user_id)
);

create table if not exists market_posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  title       text not null,
  price       integer not null,
  description text,
  image_url   text,
  category    text default '기타',
  condition   text default '양호',
  is_sold     boolean default false,
  created_at  timestamptz default now()
);

create table if not exists courses (
  id            uuid default gen_random_uuid() primary key,
  title         text not null,
  description   text,
  category      text not null,
  video_url     text,
  pdf_url       text,
  thumbnail_url text,
  instructor    text default '잡앤러닝 코치',
  duration_min  integer default 30,
  level         text default '입문',
  is_free       boolean default true,
  created_at    timestamptz default now()
);

-- ── RLS 활성화 ────────────────────────────────────────────────

alter table profiles      enable row level security;
alter table jobs           enable row level security;
alter table applications   enable row level security;
alter table market_posts   enable row level security;
alter table courses        enable row level security;

-- ── 기존 정책 제거 후 재생성 (재실행 안전) ────────────────────

-- profiles
drop policy if exists "profiles_select_all" on profiles;
drop policy if exists "profiles_insert_own"  on profiles;
drop policy if exists "profiles_update_own"  on profiles;
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- jobs
drop policy if exists "jobs_select_all" on jobs;
create policy "jobs_select_all" on jobs for select using (true);

-- applications
drop policy if exists "applications_select_own" on applications;
drop policy if exists "applications_insert_own" on applications;
drop policy if exists "applications_delete_own" on applications;
create policy "applications_select_own" on applications for select using (auth.uid() = user_id);
create policy "applications_insert_own" on applications for insert with check (auth.uid() = user_id);
create policy "applications_delete_own" on applications for delete using (auth.uid() = user_id);

-- market_posts
drop policy if exists "market_posts_select_all" on market_posts;
drop policy if exists "market_posts_insert_own" on market_posts;
drop policy if exists "market_posts_update_own" on market_posts;
drop policy if exists "market_posts_delete_own" on market_posts;
create policy "market_posts_select_all" on market_posts for select using (true);
create policy "market_posts_insert_own" on market_posts for insert with check (auth.uid() = user_id);
create policy "market_posts_update_own" on market_posts for update using (auth.uid() = user_id);
create policy "market_posts_delete_own" on market_posts for delete using (auth.uid() = user_id);

-- courses
drop policy if exists "courses_select_all" on courses;
create policy "courses_select_all" on courses for select using (true);

-- ── 프로필 자동 생성 트리거 ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 시드 데이터 ──────────────────────────────────────────────

insert into jobs (title, company, hourly_wage, location, deadline, description, category)
select * from (values
  ('카페 아르바이트',        '스타벅스 대전 대학점',  9860,  '대전 유성구', '2026-05-31'::date, '주말 오픈 포함 파트타임 근무. 외국인 지원 환영.',      '서비스업'),
  ('편의점 야간 알바',       'GS25 충남대점',         9860,  '대전 유성구', '2026-05-15'::date, '22:00~06:00 야간근무. 야간수당 별도.',                 '유통'),
  ('한식당 홀서빙',          '다문화 식당 한사랑',     10000, '대전 중구',   '2026-06-30'::date, '점심/저녁 파트타임. 한국어 초급 가능.',                '서비스업'),
  ('대학 도서관 보조',       '충남대학교 도서관',      9860,  '대전 유성구', '2026-05-20'::date, '도서 정리 및 안내 업무. 재학생 우선.',                 '사무보조'),
  ('태권도장 보조강사',      '글로벌 태권도 대전점',   12000, '대전 서구',   '2026-06-15'::date, '주 3일. 영어·베트남어 가능자 우대.',                   '스포츠'),
  ('배달 아르바이트 쿠팡',   '쿠팡이츠 대전',          11000, '대전 전역',   '2026-07-31'::date, '자전거·킥보드 가능. 외국인 등록증 필수.',              '유통')
) as v(title, company, hourly_wage, location, deadline, description, category)
where not exists (select 1 from jobs limit 1);

insert into courses (title, description, category, video_url, pdf_url, instructor, duration_min, level, is_free)
select * from (values
  ('Cursor AI로 앱 만들기 기초',      'AI 코딩 툴 Cursor로 나만의 앱을 만드는 입문 강의. 코딩 경험 불필요.',        'AI 실무(Vibe Coding)',  'https://www.youtube.com/embed/dQw4w9WgXcQ', null,  '잡앤러닝 AI 코치',     45, '입문', true),
  ('Lovable로 웹사이트 30분 완성',    '노코드 AI 플랫폼으로 포트폴리오 웹사이트 빠르게 제작하기.',                  'AI 실무(Vibe Coding)',  'https://www.youtube.com/embed/dQw4w9WgXcQ', null,  '잡앤러닝 AI 코치',     30, '입문', true),
  ('ChatGPT로 한국어 이력서 작성',    'AI로 한국 취업용 이력서·자기소개서 완성하는 실전 강의.',                     'AI 실무(Vibe Coding)',  null,                                         '#',   '잡앤러닝 AI 코치',     35, '초급', true),
  ('한국 비자 완벽 가이드 D-2→D-10', '유학생 비자 전환 절차 완벽 설명. D-2, D-10, D-8 비자 포함.',               '한국 생활 가이드',      null,                                         '#',   '잡앤러닝 비자 전문가', 60, '입문', true),
  ('대전에서 집 구하기 A to Z',       '원룸·고시원·학교 기숙사까지 외국인 주거 가이드. 계약서 읽는 법 포함.',      '한국 생활 가이드',      null,                                         '#',   '잡앤러닝 생활 코치',   40, '입문', true),
  ('한국 은행 계좌 & 카드 개설',      '외국인 등록증 발급 후 시중은행 계좌 여는 방법. 카카오뱅크·토스 포함.',      '한국 생활 가이드',      null,                                         '#',   '잡앤러닝 생활 코치',   20, '입문', true),
  ('한국 건강보험 & 4대보험 가이드',  '유학생 건강보험 가입법과 아르바이트 4대보험 처리법.',                        '한국 생활 가이드',      null,                                         '#',   '잡앤러닝 생활 코치',   30, '입문', true)
) as v(title, description, category, video_url, pdf_url, instructor, duration_min, level, is_free)
where not exists (select 1 from courses limit 1);

-- ── 완료 확인 ────────────────────────────────────────────────
select
  (select count(*) from jobs)    as jobs_count,
  (select count(*) from courses) as courses_count,
  '✅ 스키마 설치 완료!'          as status;
