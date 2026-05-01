import { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_MAP = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다. 받은 메일함을 확인해주세요.',
  'User already registered': '이미 가입된 이메일입니다. 로그인을 시도해주세요.',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
}

function friendlyError(msg) {
  return ERROR_MAP[msg] ?? msg
}

export default function AuthModal({ open, onClose, onSuccess, reason }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'done'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 약관 동의
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)

  if (!open) return null

  const emailValid = EMAIL_RE.test(email.trim())
  const passwordValid = password.length >= 6
  const agreeAll = agreePrivacy && agreeTerms && agreeMarketing

  const canSubmitLogin = emailValid && passwordValid && !loading
  const canSubmitSignup = emailValid && passwordValid && agreePrivacy && agreeTerms && !loading

  function handleClose() {
    setMode('login')
    setEmail('')
    setPassword('')
    setError('')
    setLoading(false)
    setAgreePrivacy(false)
    setAgreeTerms(false)
    setAgreeMarketing(false)
    onClose()
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
    setAgreePrivacy(false)
    setAgreeTerms(false)
    setAgreeMarketing(false)
  }

  function handleAgreeAll(checked) {
    setAgreePrivacy(checked)
    setAgreeTerms(checked)
    setAgreeMarketing(checked)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!canSubmitLogin) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (err) { setError(friendlyError(err.message)) }
    else { handleClose(); onSuccess?.() }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!canSubmitSignup) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)
    if (err) { setError(friendlyError(err.message)) }
    else { setMode('done') }
  }

  const isSignup = mode === 'signup'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className={`bg-white w-full ${isSignup ? 'max-w-lg' : 'max-w-sm'} rounded-2xl shadow-2xl animate-slide-up overflow-hidden flex flex-col max-h-[90vh]`}>

        {/* 헤더 */}
        <div className="bg-[#002147] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-0.5">
              {reason ? '로그인 필요' : isSignup ? '회원가입' : '로그인'}
            </p>
            <h3 className="font-outfit font-black text-white text-xl">
              {mode === 'done'
                ? '이메일을 확인해주세요'
                : reason
                ? '로그인이 필요합니다'
                : isSignup
                ? '잡앤러닝 회원가입'
                : '잡앤러닝 로그인'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto">

          {/* 가입 완료 화면 */}
          {mode === 'done' ? (
            <div className="text-center py-4 space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="font-bold text-[#002147]">{email}</span>로<br />
                인증 링크를 보내드렸습니다.<br />
                메일을 확인하고 링크를 클릭하면 로그인됩니다.
              </p>
              <button
                onClick={() => switchMode('login')}
                className="w-full py-3 bg-[#002147] text-white font-bold rounded-xl text-sm hover:bg-[#1a3a5f] transition-colors"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* 권한 가드 사유 */}
              {reason && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl">
                  {reason}
                </div>
              )}

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-bold text-[#002147] uppercase tracking-wide mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@email.com"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-xs font-bold text-[#002147] uppercase tracking-wide mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="6자 이상"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                />
              </div>

              {/* ── 약관 동의 (회원가입 전용) ── */}
              {isSignup && (
                <div className="rounded-xl border border-gray-200 overflow-hidden text-sm">

                  {/* 모두 동의하기 */}
                  <label className="flex items-center gap-3 px-4 py-3 bg-[#002147] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeAll}
                      onChange={e => handleAgreeAll(e.target.checked)}
                      className="w-4 h-4 accent-[#FF8C00] flex-shrink-0"
                    />
                    <span className="font-bold text-white text-sm">모두 동의하기</span>
                    <span className="ml-auto text-white/40 text-xs">필수 + 선택 포함</span>
                  </label>

                  <div className="divide-y divide-gray-100">

                    {/* 개인정보 수집·이용 동의 */}
                    <div className="p-4 bg-gray-50">
                      <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
                        <input
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={e => setAgreePrivacy(e.target.checked)}
                          className="w-4 h-4 accent-[#FF8C00] flex-shrink-0"
                        />
                        <span className="font-bold text-[#002147] text-xs">
                          [필수] 개인정보 수집 및 이용 동의
                        </span>
                        <span className="ml-auto">
                          <a
                            href="/Job_And_Learning_Privacy_Policy_v1.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#FF8C00] underline underline-offset-2 hover:text-[#e07d00]"
                          >
                            전문보기
                          </a>
                        </span>
                      </label>
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#002147] text-white">
                            <th className="border border-[#002147] px-2 py-1.5 text-left font-semibold">목적</th>
                            <th className="border border-[#002147] px-2 py-1.5 text-left font-semibold">항목</th>
                            <th className="border border-[#002147] px-2 py-1.5 text-left font-semibold whitespace-nowrap">보유 기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-gray-200 px-2 py-1.5 text-gray-600">회원 식별 및 관리, 유학/취업 컨설팅</td>
                            <td className="border border-gray-200 px-2 py-1.5 text-gray-600">이름, 이메일, 비밀번호</td>
                            <td className="border border-gray-200 px-2 py-1.5 font-bold text-red-500 whitespace-nowrap">탈퇴 시까지</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-200 px-2 py-1.5 text-gray-600">맞춤형 매칭 서비스 (선택)</td>
                            <td className="border border-gray-200 px-2 py-1.5 text-gray-600">학력, 전공, 경력</td>
                            <td className="border border-gray-200 px-2 py-1.5 text-gray-500 whitespace-nowrap">탈퇴 시까지</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-[10px] text-gray-400 mt-2">* 필수 항목 거부 시 서비스 이용이 제한될 수 있습니다.</p>
                    </div>

                    {/* 서비스 이용약관 */}
                    <div className="p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={e => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 accent-[#FF8C00] flex-shrink-0"
                        />
                        <span className="font-bold text-[#002147] text-xs">[필수] 서비스 이용약관 동의</span>
                      </label>
                      <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg px-3 py-2.5 text-[11px] text-gray-500 leading-relaxed bg-gray-50">
                        <p className="font-bold text-gray-700 mb-1">제1조 (목적)</p>
                        <p className="mb-2">본 약관은 잡앤러닝(JOB AND LEARNING)이 운영하는 d2d4.kr 플랫폼에서 제공하는 유학, 취업, 창업 지원 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p>
                        <p className="font-bold text-gray-700 mb-1">제2조 (서비스의 제공)</p>
                        <p className="mb-2">회사는 회원에게 다음과 같은 서비스를 제공합니다.<br/>1. 한국 대학/대학원 유학 정보 및 컨설팅<br/>2. AI 기반 이력서 작성 가이드 및 채용 매칭<br/>3. 글로벌 창업 교육 및 멘토링 프로그램 지원</p>
                        <p className="font-bold text-gray-700 mb-1">제3조 (회원의 의무)</p>
                        <p className="mb-2">1. 회원은 가입 시 정확한 정보를 제공해야 하며, 타인의 정보를 도용해서는 안 됩니다.<br/>2. 서비스의 정상적인 운영을 방해하거나 공공질서를 해치는 게시물을 등록할 수 없습니다.</p>
                        <p className="font-bold text-gray-700 mb-1">제4조 (개인정보 보호)</p>
                        <p className="mb-2">회사는 별도로 게시된 개인정보처리방침에 따라 회원의 개인정보를 보호하며, 서비스 제공 목적 외에 제3자에게 무단 제공하지 않습니다.</p>
                        <p className="font-bold text-gray-700 mb-1">제5조 (게시물의 책임)</p>
                        <p>회원이 등록한 이력서 및 게시물에 대한 신뢰도와 법적 책임은 회원 본인에게 있으며, 허위 사실 기재 시 서비스 이용이 영구 제한될 수 있습니다.</p>
                      </div>
                    </div>

                    {/* 마케팅 수신 동의 */}
                    <div className="px-4 py-3 bg-gray-50">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreeMarketing}
                          onChange={e => setAgreeMarketing(e.target.checked)}
                          className="w-4 h-4 accent-[#FF8C00] flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-semibold text-gray-600">[선택] 마케팅 정보 수신 동의</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">신규 교육 프로그램, 유학/취업 박람회 정보 및 d2d4.kr의 주요 이벤트 알림을 받아보실 수 있습니다.</p>
                        </div>
                      </label>
                    </div>

                  </div>
                </div>
              )}

              {/* 에러 */}
              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl">{error}</div>
              )}

              {/* 버튼 */}
              {mode === 'login' ? (
                <>
                  <button
                    onClick={handleLogin}
                    disabled={!canSubmitLogin}
                    className="w-full py-3.5 bg-[#002147] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#1a3a5f] transition-colors"
                  >
                    {loading ? '로그인 중…' : '로그인 →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="w-full py-3 border-2 border-[#002147]/20 text-[#002147] font-bold rounded-xl text-sm hover:border-[#002147]/40 hover:bg-[#002147]/5 transition-colors"
                  >
                    처음이신가요? 회원가입하기 →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignup}
                    disabled={!canSubmitSignup}
                    className="w-full py-3.5 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#e07d00] transition-colors"
                  >
                    {loading ? '처리 중…' : '이메일 인증 후 가입하기 →'}
                  </button>
                  {!agreePrivacy && !agreeTerms && (
                    <p className="text-center text-[11px] text-gray-400">필수 약관에 동의하면 가입 버튼이 활성화됩니다.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← 이미 계정이 있어요, 로그인하기
                  </button>
                </>
              )}

              {/* 익명 계속 */}
              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-500 transition-colors"
                >
                  로그인 없이 둘러보기
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
