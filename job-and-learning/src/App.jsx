import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { t } from './lib/translations'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import AuthModal from './components/AuthModal'
import MyPageModal from './components/MyPageModal'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Market from './pages/Market'
import Learning from './pages/Learning'
import Community from './pages/Community'
import Help from './pages/Help'

function Footer({ lang }) {
  const tr = t[lang] ?? t.ko
  return (
    <footer className="bg-[#002147] text-white/40 py-6 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-1.5">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="Job and Learning" className="h-28 w-auto object-contain" />
        </div>
        <p className="text-xs">
          {tr.footerReg}: <span className="text-white/60 font-semibold">J1700020240003</span>
        </p>
        <p className="text-[11px]">
          <a
            href="/d2d4-terms-of-service.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            운영 약관
          </a>
        </p>
        <p className="text-[10px] pt-1 border-t border-white/10">{tr.footerCopy}</p>
      </div>
    </footer>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [lang, setLang] = useState('ko')
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authReason, setAuthReason] = useState('')
  const [showMyPage, setShowMyPage] = useState(false)

  useEffect(() => {
    // 기존 세션 복원 (localStorage → 자동 복원)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { console.error('[Auth] getSession error:', error.message); return }
      if (session?.user) {
        setUser(session.user)
      } else {
        // 세션 없을 때만 익명 로그인 (브라우징 전용)
        supabase.auth.signInAnonymously().then(({ data, error: anonError }) => {
          if (anonError) console.error('[Auth] anonymous sign-in error:', anonError.message)
          else setUser(data?.user ?? null)
        })
      }
    })

    // 로그인/로그아웃/토큰 갱신 등 모든 auth 이벤트 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user) {
        setUser(session.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const isLoggedIn = user && !user.is_anonymous

  function handleLogout() {
    supabase.auth.signOut()
    setTab('home')
    setShowMyPage(false)
  }

  function handleLoginRequired(reason) {
    setAuthReason(reason ?? '')
    setShowAuth(true)
  }

  const pages = { home: Home, jobs: Jobs, market: Market, learning: Learning, community: Community, help: Help }
  const Page = pages[tab]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        tab={tab}
        setTab={setTab}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onMyPageClick={() => setShowMyPage(true)}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
      />
      <main className="flex-1 pb-16 md:pb-0">
        <Page
          user={user}
          onTabChange={setTab}
          lang={lang}
          onLoginRequired={handleLoginRequired}
        />
      </main>
      <Footer lang={lang} />
      <BottomNav tab={tab} setTab={setTab} />
      <MyPageModal
        open={showMyPage}
        onClose={() => setShowMyPage(false)}
        user={user}
        onLogout={handleLogout}
      />
      <AuthModal
        open={showAuth}
        onClose={() => { setShowAuth(false); setAuthReason('') }}
        onSuccess={() => { setShowAuth(false); setAuthReason(''); setTab('home') }}
        reason={authReason}
      />
    </div>
  )
}
