import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { t } from './lib/translations'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
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
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-[#FF8C00] rounded-md flex items-center justify-center font-outfit text-[10px] font-black text-white select-none">
            J&L
          </div>
          <span className="text-white/60 font-outfit font-bold text-sm">Job & Learning</span>
        </div>
        <p className="text-xs">
          {tr.footerReg}: <span className="text-white/60 font-semibold">J1700020240003</span>
        </p>
        <p className="text-[11px]">{tr.footerCoach}</p>
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { console.error('[Auth] getSession error:', error.message); return }
      if (session?.user) {
        setUser(session.user)
      } else {
        supabase.auth.signInAnonymously().then(({ data, error: anonError }) => {
          if (anonError) console.error('[Auth] anonymous sign-in error:', anonError.message)
          setUser(data?.user ?? null)
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const pages = { home: Home, jobs: Jobs, market: Market, learning: Learning, community: Community, help: Help }
  const Page = pages[tab]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        tab={tab}
        setTab={setTab}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        lang={lang}
        setLang={setLang}
      />
      <main className="flex-1">
        <Page user={user} onTabChange={setTab} lang={lang} />
      </main>
      <Footer lang={lang} />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
