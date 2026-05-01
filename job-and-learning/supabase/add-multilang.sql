-- ── 다국어 컬럼 추가 (jobs) ──────────────────────────────────
alter table jobs
  add column if not exists title_en       text,
  add column if not exists description_en text,
  add column if not exists title_vi       text,
  add column if not exists description_vi text;

-- ── 다국어 컬럼 추가 (courses) ───────────────────────────────
alter table courses
  add column if not exists title_en       text,
  add column if not exists description_en text,
  add column if not exists title_vi       text,
  add column if not exists description_vi text;

-- ── jobs 번역 데이터 ─────────────────────────────────────────
update jobs set
  title_en = 'Café Part-time Job',
  description_en = 'Part-time including weekend opens. International applicants welcome.',
  title_vi = 'Làm thêm tại quán cà phê',
  description_vi = 'Làm thêm cuối tuần. Chào đón người nước ngoài.'
where title = '카페 아르바이트';

update jobs set
  title_en = 'Convenience Store Night Shift',
  description_en = '22:00–06:00 night shift. Extra night pay included.',
  title_vi = 'Ca đêm cửa hàng tiện lợi',
  description_vi = 'Ca đêm 22:00–06:00. Có phụ cấp đêm riêng.'
where title = '편의점 야간 알바';

update jobs set
  title_en = 'Korean Restaurant Hall Server',
  description_en = 'Lunch/dinner part-time. Beginner Korean OK.',
  title_vi = 'Phục vụ nhà hàng Hàn Quốc',
  description_vi = 'Bán thời gian trưa/tối. Tiếng Hàn sơ cấp được.'
where title = '한식당 홀서빙';

update jobs set
  title_en = 'University Library Assistant',
  description_en = 'Book shelving and information desk. Current students preferred.',
  title_vi = 'Trợ lý thư viện đại học',
  description_vi = 'Sắp xếp sách và hướng dẫn. Ưu tiên sinh viên đang học.'
where title = '대학 도서관 보조';

update jobs set
  title_en = 'Taekwondo Assistant Instructor',
  description_en = '3 days/week. English or Vietnamese speakers preferred.',
  title_vi = 'Trợ lý huấn luyện viên Taekwondo',
  description_vi = '3 ngày/tuần. Ưu tiên người nói tiếng Anh hoặc tiếng Việt.'
where title = '태권도장 보조강사';

update jobs set
  title_en = 'Coupang Delivery Part-time',
  description_en = 'Bicycle or kickboard required. Alien registration card mandatory.',
  title_vi = 'Giao hàng Coupang làm thêm',
  description_vi = 'Cần xe đạp hoặc xe điện. Bắt buộc có thẻ đăng ký người nước ngoài.'
where title = '배달 아르바이트 쿠팡';

-- ── courses 번역 데이터 ───────────────────────────────────────
update courses set
  title_en = 'Building Apps with Cursor AI',
  description_en = 'Beginner course to build your own app using the AI coding tool Cursor. No coding experience needed.',
  title_vi = 'Tạo ứng dụng với Cursor AI',
  description_vi = 'Khóa học nhập môn tạo ứng dụng bằng công cụ AI Cursor. Không cần kinh nghiệm lập trình.'
where title = 'Cursor AI로 앱 만들기 기초';

update courses set
  title_en = 'Build a Website in 30 Min with Lovable',
  description_en = 'Quickly create a portfolio website using the no-code AI platform Lovable.',
  title_vi = 'Tạo website 30 phút với Lovable',
  description_vi = 'Tạo nhanh website portfolio bằng nền tảng AI không cần code Lovable.'
where title = 'Lovable로 웹사이트 30분 완성';

update courses set
  title_en = 'Writing a Korean Resume with ChatGPT',
  description_en = 'Practical course to write a Korean job resume and cover letter using AI.',
  title_vi = 'Viết CV tiếng Hàn bằng ChatGPT',
  description_vi = 'Khóa học thực tế viết CV và thư xin việc tiếng Hàn bằng AI.'
where title = 'ChatGPT로 한국어 이력서 작성';

update courses set
  title_en = 'Complete Korea Visa Guide D-2 → D-10',
  description_en = 'Full explanation of student visa transfer procedures. Covers D-2, D-10, and D-8 visas.',
  title_vi = 'Hướng dẫn visa Hàn Quốc D-2 → D-10',
  description_vi = 'Giải thích đầy đủ thủ tục chuyển đổi visa du học. Bao gồm D-2, D-10, D-8.'
where title = '한국 비자 완벽 가이드 D-2→D-10';

update courses set
  title_en = 'Finding a Home in Daejeon A to Z',
  description_en = 'Foreigner housing guide from studio to goshiwon and dormitory. Includes how to read a lease.',
  title_vi = 'Tìm nhà tại Daejeon A to Z',
  description_vi = 'Hướng dẫn nhà ở cho người nước ngoài từ phòng trọ đến ký túc xá. Bao gồm cách đọc hợp đồng thuê.'
where title = '대전에서 집 구하기 A to Z';

update courses set
  title_en = 'Opening a Korean Bank Account & Card',
  description_en = 'How to open a bank account after getting your alien registration card. Includes KakaoBank and Toss.',
  title_vi = 'Mở tài khoản ngân hàng & thẻ Hàn Quốc',
  description_vi = 'Cách mở tài khoản sau khi có thẻ đăng ký người nước ngoài. Bao gồm KakaoBank và Toss.'
where title = '한국 은행 계좌 & 카드 개설';

update courses set
  title_en = 'Korean Health Insurance & Social Insurance Guide',
  description_en = 'How to enroll in health insurance and handle social insurance for part-time work.',
  title_vi = 'Hướng dẫn bảo hiểm y tế & bảo hiểm xã hội Hàn Quốc',
  description_vi = 'Cách đăng ký bảo hiểm y tế và xử lý bảo hiểm xã hội khi làm thêm.'
where title = '한국 건강보험 & 4대보험 가이드';

select '✅ 다국어 컬럼 추가 및 번역 데이터 입력 완료!' as status;
