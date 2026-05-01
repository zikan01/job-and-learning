import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal({ open, onClose, onSuccess, reason, lang }) {
  const tr = (t[lang] ?? t.ko).auth

  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'done'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)

  if (!open) return null

  const emailValid = EMAIL_RE.test(email.trim())
  const passwordValid = password.length >= 6
  const agreeAll = agreePrivacy && agreeTerms && agreeMarketing

  const canSubmitLogin  = emailValid && passwordValid && !loading
  const canSubmitSignup = emailValid && passwordValid && agreePrivacy && agreeTerms && !loading

  function friendlyError(msg) {
    return tr.errors[msg] ?? msg
  }

  function handleClose() {
    setMode('login'); setEmail(''); setPassword(''); setError(''); setLoading(false)
    setAgreePrivacy(false); setAgreeTerms(false); setAgreeMarketing(false)
    onClose()
  }

  function switchMode(next) {
    setMode(next); setError(''); setPassword('')
    setAgreePrivacy(false); setAgreeTerms(false); setAgreeMarketing(false)
  }

  function handleAgreeAll(checked) {
    setAgreePrivacy(checked); setAgreeTerms(checked); setAgreeMarketing(checked)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!canSubmitLogin) return
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (err) { setError(friendlyError(err.message)) }
    else { handleClose(); onSuccess?.() }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!canSubmitSignup) return
    setLoading(true); setError('')
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
              {reason ? tr.loginBadge : isSignup ? tr.signupBadge : tr.loginBadge2}
            </p>
            <h3 className="font-outfit font-black text-white text-xl">
              {mode === 'done'
                ? tr.doneTitle
                : reason
                ? tr.loginRequired
                : isSignup
                ? tr.signupTitle
                : tr.loginTitle}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-lg"
          >×</button>
        </div>

        <div className="px-6 py-6 overflow-y-auto">

          {/* 가입 완료 */}
          {mode === 'done' ? (
            <div className="text-center py-4 space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {lang === 'en' || lang === 'vi' ? (
                  <>{tr.doneMsg2}<br /><span className="font-bold text-[#002147]">{email}</span><br />{tr.doneMsg3}</>
                ) : (
                  <><span className="font-bold text-[#002147]">{email}</span>{tr.doneMsg1}<br />{tr.doneMsg2}<br />{tr.doneMsg3}</>
                )}
              </p>
              <button
                onClick={() => switchMode('login')}
                className="w-full py-3 bg-[#002147] text-white font-bold rounded-xl text-sm hover:bg-[#1a3a5f] transition-colors"
              >
                {tr.backToLogin}
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* 권한 사유 */}
              {reason && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl">
                  {reason}
                </div>
              )}

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-bold text-[#002147] uppercase tracking-wide mb-1.5">
                  {tr.labelEmail}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder={tr.placeholderEmail}
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-xs font-bold text-[#002147] uppercase tracking-wide mb-1.5">
                  {tr.labelPassword}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder={tr.placeholderPassword}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10 transition-all"
                />
              </div>

              {/* 약관 동의 (회원가입 전용) */}
              {isSignup && (
                <div className="rounded-xl border border-gray-200 overflow-hidden text-sm">

                  {/* 모두 동의 */}
                  <label className="flex items-center gap-3 px-4 py-3 bg-[#002147] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeAll}
                      onChange={e => handleAgreeAll(e.target.checked)}
                      className="w-4 h-4 accent-[#FF8C00] flex-shrink-0"
                    />
                    <span className="font-bold text-white text-sm">{tr.agreeAll}</span>
                    <span className="ml-auto text-white/40 text-xs">{tr.agreeAllSub}</span>
                  </label>

                  <div className="divide-y divide-gray-100">

                    {/* 개인정보 동의 */}
                    <div className="p-4 bg-gray-50">
                      <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
                        <input
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={e => setAgreePrivacy(e.target.checked)}
                          className="w-4 h-4 accent-[#FF8C00] flex-shrink-0"
                        />
                        <span className="font-bold text-[#002147] text-xs">{tr.agreePrivacy}</span>
                        <span className="ml-auto">
                          <a
                            href="/Job_And_Learning_Privacy_Policy_v1.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#FF8C00] underline underline-offset-2 hover:text-[#e07d00]"
                          >
                            {tr.agreePrivacyLink}
                          </a>
                        </span>
                      </label>
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#002147] text-white">
                            {tr.tableHeaders.map(h => (
                              <th key={h} className="border border-[#002147] px-2 py-1.5 text-left font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tr.tableRows.map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-200 px-2 py-1.5 text-gray-600">{row[0]}</td>
                              <td className="border border-gray-200 px-2 py-1.5 text-gray-600">{row[1]}</td>
                              <td className={`border border-gray-200 px-2 py-1.5 whitespace-nowrap ${i === 0 ? 'font-bold text-red-500' : 'text-gray-500'}`}>{row[2]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-[10px] text-gray-400 mt-2">{tr.tableNote}</p>
                    </div>

                    {/* 이용약관 */}
                    <div className="p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={e => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 accent-[#FF8C00] flex-shrink-0"
                        />
                        <span className="font-bold text-[#002147] text-xs">{tr.agreeTerms}</span>
                      </label>
                      <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg px-3 py-2.5 text-[11px] text-gray-500 leading-relaxed bg-gray-50 whitespace-pre-wrap">
                        {tr.termsContent}
                      </div>
                    </div>

                    {/* 마케팅 */}
                    <div className="px-4 py-3 bg-gray-50">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreeMarketing}
                          onChange={e => setAgreeMarketing(e.target.checked)}
                          className="w-4 h-4 accent-[#FF8C00] flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-semibold text-gray-600">{tr.agreeMarketing}</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tr.agreeMarketingDesc}</p>
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
                    {loading ? tr.loginLoading : tr.loginBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="w-full py-3 border-2 border-[#002147]/20 text-[#002147] font-bold rounded-xl text-sm hover:border-[#002147]/40 hover:bg-[#002147]/5 transition-colors"
                  >
                    {tr.toSignup}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignup}
                    disabled={!canSubmitSignup}
                    className="w-full py-3.5 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#e07d00] transition-colors"
                  >
                    {loading ? tr.signupLoading : tr.signupBtn}
                  </button>
                  {!agreePrivacy && !agreeTerms && (
                    <p className="text-center text-[11px] text-gray-400">{tr.agreeHint}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {tr.toLogin}
                  </button>
                </>
              )}

              {/* 익명 둘러보기 */}
              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-500 transition-colors"
                >
                  {tr.browseAnon}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
