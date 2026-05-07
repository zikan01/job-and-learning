-- ── 일본어 컬럼 추가 (jobs) ──────────────────────────────────
alter table jobs
  add column if not exists title_ja       text,
  add column if not exists description_ja text;

-- ── 일본어 컬럼 추가 (courses) ───────────────────────────────
alter table courses
  add column if not exists title_ja       text,
  add column if not exists description_ja text;

-- ── jobs 번역 데이터 (일본어) ─────────────────────────────────
update jobs set
  title_ja = 'カフェアルバイト',
  description_ja = '週末オープン含むパートタイム勤務。外国人歓迎。'
where title = '카페 아르바이트';

update jobs set
  title_ja = 'コンビニ夜間アルバイト',
  description_ja = '22:00〜06:00夜間勤務。夜間手当別途。韓国語初級可。'
where title = '편의점 야간 알바';

update jobs set
  title_ja = '韓食堂ホールサービス',
  description_ja = '昼・夜のパートタイム。韓国語初級でも可。'
where title = '한식당 홀서빙';

update jobs set
  title_ja = '大学図書館アシスタント',
  description_ja = '書籍整理・案内カウンター業務。在学生優遇。'
where title = '대학 도서관 보조';

update jobs set
  title_ja = 'テコンドー場アシスタントインストラクター',
  description_ja = '週3日勤務。英語またはベトナム語話者優遇。'
where title = '태권도장 보조강사';

update jobs set
  title_ja = '配達アルバイト（クーパン）',
  description_ja = '自転車またはキックボード必須。外国人登録証必須。'
where title = '배달 아르바이트 쿠팡';

-- ── courses 번역 데이터 (일본어) ──────────────────────────────
update courses set
  title_ja = 'Cursor AIでアプリを作る基礎',
  description_ja = 'AIコーディングツールCursorを使って自分のアプリを作る入門コース。プログラミング経験不要。'
where title = 'Cursor AI로 앱 만들기 기초';

update courses set
  title_ja = 'Lovableで30分でウェブサイト完成',
  description_ja = 'ノーコードAIプラットフォームLovableを使ってポートフォリオサイトを素早く作成。'
where title = 'Lovable로 웹사이트 30분 완성';

update courses set
  title_ja = 'ChatGPTで韓国語履歴書作成',
  description_ja = 'AIを使って韓国語の求職履歴書とカバーレターを書く実践コース。'
where title = 'ChatGPT로 한국어 이력서 작성';

update courses set
  title_ja = '韓国ビザ完全ガイド D-2→D-10',
  description_ja = '留学ビザ切り替え手続きの全解説。D-2、D-10、D-8ビザをカバー。'
where title = '한국 비자 완벽 가이드 D-2→D-10';

update courses set
  title_ja = '大田での住居探し A to Z',
  description_ja = 'ワンルームからコシウォン・寮まで外国人向け住居ガイド。賃貸契約書の読み方も解説。'
where title = '대전에서 집 구하기 A to Z';

update courses set
  title_ja = '韓国銀行口座＆カード開設',
  description_ja = '外国人登録証取得後の口座開設方法。KakaoBank・Tossの手順も解説。'
where title = '한국 은행 계좌 & 카드 개설';

update courses set
  title_ja = '韓国健康保険＆4大保険ガイド',
  description_ja = '健康保険への加入方法とアルバイト時の社会保険の手続き方法。'
where title = '한국 건강보험 & 4대보험 가이드';

update courses set
  title_ja = '外国人留学生起業ビザ(D-8-4) OASISガイド',
  description_ja = 'D-8-4起業ビザの取得条件・申請方法・OASISプログラムの全解説。'
where title = '외국인 유학생 창업비자(D-8-4) OASIS 취득 가이드';

select '✅ 일본어 컬럼 추가 및 번역 데이터 입력 완료!' as status;
