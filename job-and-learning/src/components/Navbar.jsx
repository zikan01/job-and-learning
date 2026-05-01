import { t } from '../lib/translations'

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VI' },
]

const TAB_IDS = ['home', 'jobs', 'market', 'learning', 'community', 'help']

export default function Navbar({ tab, setTab, user, onLoginClick, onMyPageClick, onLogout, lang, setLang }) {
  const tr = t[lang] ?? t.ko
  const isAnon = !user || user.is_anonymous
  const initial = user?.email ? user.email[0].toUpperCase() : '유'

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* 메인 헤더: 로고 + 탭 + 언어선택 + 로그인 */}
      <div className="bg-[#002147]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex items-center gap-3 md:gap-6">
          {/* 로고 */}
          <button onClick={() => setTab('home')} className="flex items-center flex-shrink-0 active:opacity-70 transition-opacity">
            <img
              src="/logo.png"
              alt="Job and Learning"
              className="h-8 w-auto object-contain"
            />
          </button>

          {/* 탭 네비게이션 (데스크탑 전용) */}
          <nav className="flex-1 hidden md:flex items-center overflow-x-auto no-scrollbar">
            {TAB_IDS.map(id => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  tab === id ? 'text-[#FF8C00]' : 'text-white/60 hover:text-white'
                }`}
              >
                {tr.tabs[id]}
                {tab === id && (
                  <span className="absolute bottom-1 left-2 right-2 h-0.5 bg-[#FF8C00] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* 모바일: 탭 대신 spacer */}
          <div className="flex-1 md:hidden" />

          {/* 언어 선택 버튼 */}
          <div className="flex items-center gap-0.5 md:gap-1 bg-white/10 rounded-xl p-1 flex-shrink-0">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  lang === code
                    ? 'bg-[#FF8C00] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 로그인 전: 로그인 버튼 */}
          {isAnon ? (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 bg-[#FF8C00] text-white px-3 md:px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex-shrink-0"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">{tr.login}</span>
            </button>
          ) : (
            /* 로그인 후: 내 활동 + 로그아웃 */
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onMyPageClick}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2 md:px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF8C00] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                  {initial}
                </div>
                <span className="hidden sm:inline max-w-[72px] truncate">{user.email?.split('@')[0]}</span>
              </button>
              <button
                onClick={onLogout}
                className="hidden md:flex items-center gap-1 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
