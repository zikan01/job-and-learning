import { t } from '../lib/translations'

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VI' },
]

const TAB_IDS = ['home', 'jobs', 'market', 'learning', 'community', 'help']

export default function Navbar({ tab, setTab, user, onLoginClick, lang, setLang }) {
  const tr = t[lang] ?? t.ko
  const isAnon = !user || user.is_anonymous
  const initial = user?.email ? user.email[0].toUpperCase() : '유'

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* 메인 헤더: 로고 + 탭 + 언어선택 + 로그인 */}
      <div className="bg-[#002147]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          {/* 로고 */}
          <div className="flex items-center flex-shrink-0 overflow-visible">
            <img
              src="/logo.png"
              alt="Job and Learning"
              className="h-28 w-auto object-contain" style={{filter: 'hue-rotate(175deg) saturate(4) brightness(1.2) contrast(1.1)'}}
            />
          </div>

          {/* 탭 네비게이션 (헤더 중앙) */}
          <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar">
            {TAB_IDS.map(id => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-shrink-0 px-5 h-16 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  tab === id ? 'text-[#FF8C00]' : 'text-white/60 hover:text-white'
                }`}
              >
                {tr.tabs[id]}
                {tab === id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#FF8C00] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* 언어 선택 버튼 */}
          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 flex-shrink-0">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  lang === code
                    ? 'bg-[#FF8C00] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 로그인 버튼 */}
          <button
            onClick={onLoginClick}
            className={`flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0 ${
              isAnon
                ? 'bg-[#FF8C00] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md'
                : 'bg-[#FF8C00]/20 px-3 py-2 rounded-xl'
            }`}
          >
            {isAnon ? (
              <>
                <span>🔐</span>
                <span>{tr.login}</span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full bg-[#FF8C00] flex items-center justify-center text-white text-xs font-bold">
                  {initial}
                </div>
                <span className="text-white/80 text-sm font-semibold max-w-[80px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
