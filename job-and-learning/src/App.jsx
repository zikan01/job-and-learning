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

function TermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-blue-300 tracking-widest uppercase mb-0.5">d2d4.kr</p>
            <h2 className="text-base font-bold">이용약관</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none transition-colors">×</button>
        </div>
        {/* 본문 */}
        <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 leading-relaxed space-y-5">
          <p className="text-xs text-gray-400">시행일: 2025년 5월 1일 | 운영사: 잡앤러닝 (Job &amp; Learning)</p>

          {[
            ['제1조 (목적)', '이 약관은 잡앤러닝(Job & Learning, 이하 "회사")이 운영하는 d2d4.kr(d2d4, 이하 "서비스")의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다. 본 서비스는 대한민국에 거주하는 외국인 유학생을 주요 대상으로, 아르바이트·취업 정보 제공, 중고 장터, 한국 생활 정착 강의 등의 기능을 통해 유학생의 한국 생활 정주를 지원합니다.'],
            ['제2조 (용어의 정의)', '"서비스"란 회사가 d2d4.kr 도메인을 통해 제공하는 일체의 온라인 서비스를 말합니다. "이용자"란 이 약관에 동의하고 서비스를 이용하는 모든 자를 말합니다. "회원"이란 이메일 등 개인정보를 제공하여 회원 등록을 완료한 자를 말합니다. "게시물"이란 회원이 서비스 내에 등록한 텍스트, 이미지, 링크 등 일체의 정보를 말합니다.'],
            ['제3조 (약관의 효력 및 변경)', '이 약관은 서비스 화면에 게시하거나 이용자에게 통지함으로써 효력이 발생합니다. 회사는 약관을 변경하는 경우 시행일 7일 전부터 서비스 내 공지 또는 이메일로 이용자에게 고지합니다. 단, 이용자에게 불리한 변경의 경우 30일 전에 고지합니다.'],
            ['제4조 (서비스의 제공)', '회사는 ① 아르바이트·취업 정보 제공 ② 유학생 중고 물품 장터 ③ 한국 생활 정착 강의 및 AI 실무 교육 콘텐츠 ④ 유학생 생활 가이드 등을 제공합니다. 서비스는 연중 24시간 제공함을 원칙으로 하며, 시스템 점검 시 사전 공지 후 일시 중단될 수 있습니다.'],
            ['제5조 (회원 가입)', '이용자는 이메일 주소와 비밀번호를 입력하고 이 약관에 동의함으로써 회원 가입을 신청할 수 있습니다. 타인의 명의 사용, 허위 정보 입력, 약관 위반 이력이 있는 경우 가입이 거절될 수 있습니다. 만 14세 미만은 가입이 제한됩니다.'],
            ['제6조 (회원 정보 관리)', '회원은 아이디(이메일) 및 비밀번호를 직접 관리할 책임이 있으며, 제3자에게 이를 공개해서는 안 됩니다. 계정 도용 발견 시 즉시 회사에 신고하여야 합니다. 회원은 언제든지 서비스 내 탈퇴 기능을 통해 탈퇴를 요청할 수 있습니다.'],
            ['제7조 (서비스 이용 주의사항)', '서비스에 게시된 구인 정보는 정보 제공 목적이며, 회사는 거래·계약 등에 대해 책임을 지지 않습니다. 외국인 유학생(D-2, D-4 비자)은 출입국관리법에 따라 학기 중 주 20시간 근무 제한이 있습니다. 중고 장터의 실제 거래는 회원 당사자 간에 이루어지며, 사기 의심 시 신고 기능을 활용하시기 바랍니다.'],
            ['제8조 (금지 행위)', '이용자는 ① 허위 정보 등록 ② 타인 계정 도용 ③ 서비스 운영 방해(해킹 등) ④ 음란물·불법 콘텐츠 게시 ⑤ 타인의 지적 재산권 침해 ⑥ 사기·피싱 등 이용자에게 피해를 주는 행위를 하여서는 안 됩니다.'],
            ['제9조 (서비스 이용 제한)', '회사는 금지 행위를 한 회원에게 경고 → 일시 정지 → 영구 정지 순으로 단계적 조치를 취할 수 있습니다. 이용 제한에 이의가 있는 경우 제한 조치일로부터 30일 이내에 고객 문의를 통해 이의를 신청할 수 있습니다.'],
            ['제10조 (개인정보 보호)', '회사는 「개인정보 보호법」을 준수하여 이용자의 개인정보를 보호합니다. 이용자의 개인정보는 법령에 근거하지 않고 제3자에게 제공하지 않으며, 수집 목적 이외의 용도로 사용하지 않습니다.'],
            ['제11조 (지적 재산권)', '서비스 내 회사가 제작한 콘텐츠의 저작권은 회사에 귀속됩니다. 이용자가 게시한 게시물의 저작권은 해당 이용자에게 있으나, 서비스 운영 목적으로 회사가 사용할 수 있습니다.'],
            ['제12조 (면책 조항)', '회사는 천재지변·해킹·통신 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다. 이용자 간 거래·분쟁에 대해 개입하지 않으며, 서비스 내 정보의 정확성·적법성을 보증하지 않습니다. 단, 회사의 고의 또는 중대한 과실로 인한 손해는 책임을 집니다.'],
            ['제13조 (분쟁 해결 및 관할)', '이 약관은 대한민국 법령에 따라 해석·적용됩니다. 분쟁 발생 시 상호 협의를 우선하며, 소송이 제기되는 경우 회사 소재지(대전광역시 중구)를 관할하는 법원을 제1심 관할 법원으로 합니다.'],
            ['제14조 (연락처)', '운영사: 잡앤러닝 (Job & Learning) | 서비스명: d2d4 (d2d4.kr) | 이메일: firstzikan@gmail.com | 소재지: 대전광역시 중구 대전천서로 501-1 | 운영 시간: 평일 10:00~18:00'],
          ].map(([title, content]) => (
            <div key={title}>
              <h3 className="font-bold text-[#002147] mb-1">{title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{content}</p>
            </div>
          ))}

          <p className="text-center text-xs text-gray-400 pt-2 border-t">본 약관은 2025년 5월 1일부터 시행됩니다.</p>
        </div>
        {/* 닫기 버튼 */}
        <div className="px-6 py-3 border-t flex-shrink-0">
          <button onClick={onClose} className="w-full bg-[#002147] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#003580] transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

function Footer({ lang }) {
  const tr = t[lang] ?? t.ko
  const [showTerms, setShowTerms] = useState(false)
  return (
    <>
      <footer className="bg-[#002147] text-white/40 py-6 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-1.5">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Job and Learning" className="h-28 w-auto object-contain" />
          </div>
          <p className="text-xs">
            {tr.footerReg}: <span className="text-white/60 font-semibold">J1700020240003</span>
          </p>
          <p className="text-[11px]">
            <button
              onClick={() => setShowTerms(true)}
              className="underline underline-offset-2 hover:text-white/80 transition-colors cursor-pointer"
            >
              운영 약관
            </button>
          </p>
          <p className="text-[10px] pt-1 border-t border-white/10">{tr.footerCopy}</p>
        </div>
      </footer>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
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
    const isVerified = u => u.is_anonymous || !!u.email_confirmed_at

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { console.error('[Auth] getSession error:', error.message); return }
      if (session?.user && isVerified(session.user)) {
        setUser(session.user)
      } else {
        supabase.auth.signInAnonymously().then(({ data, error: anonError }) => {
          if (anonError) console.error('[Auth] anonymous sign-in error:', anonError.message)
          else setUser(data?.user ?? null)
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user && isVerified(session.user)) {
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
      <BottomNav tab={tab} setTab={setTab} lang={lang} />
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
