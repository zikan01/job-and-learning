import { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const emailValid = EMAIL_RE.test(email.trim())
  const tokenValid = /^\d{6}$/.test(token)

  function reset() {
    setStep('email')
    setEmail('')
    setToken('')
    setError('')
    setLoading(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    if (!emailValid) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('otp')
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (!tokenValid) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'email',
    })
    setLoading(false)
    if (err) {
      setError('인증번호가 올바르지 않거나 만료되었습니다.')
    } else {
      reset()
      onSuccess?.()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl animate-slide-up overflow-hidden">

        {/* 헤더 */}
        <div className="bg-[#1a3a5f] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-0.5">
              {step === 'email' ? '간편 로그인' : '인증번호 확인'}
            </p>
            <h3 className="font-outfit font-black text-white text-xl">
              {step === 'email' ? '이메일로 시작하기' : '인증번호를 입력해주세요'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">

          {/* Step 1: 이메일 입력 */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a3a5f] uppercase tracking-wide mb-1.5">
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@email.com"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a3a5f] focus:ring-2 focus:ring-[#1a3a5f]/10 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl">{error}</div>
              )}

              <button
                type="submit"
                disabled={!emailValid || loading}
                className="w-full py-3.5 bg-[#1a3a5f] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#243f6a] transition-colors"
              >
                {loading ? '전송 중…' : '인증번호 받기 →'}
              </button>

              <p className="text-center text-xs text-gray-400">
                이메일로 6자리 인증번호를 보내드립니다
              </p>
            </form>
          )}

          {/* Step 2: OTP 입력 */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-xs text-gray-400">인증번호 전송됨</p>
                  <p className="text-sm font-semibold text-[#1a3a5f]">{email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a3a5f] uppercase tracking-wide mb-1.5">
                  6자리 인증번호
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={token}
                  onChange={e => { setToken(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder="000000"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a3a5f] focus:ring-2 focus:ring-[#1a3a5f]/10 tracking-[0.4em] text-center font-outfit font-bold text-lg transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl">{error}</div>
              )}

              <button
                type="submit"
                disabled={!tokenValid || loading}
                className="w-full py-3.5 bg-[#1a3a5f] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#243f6a] transition-colors"
              >
                {loading ? '확인 중…' : '로그인 완료 →'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setToken(''); setError('') }}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← 이메일 다시 입력하기
              </button>
            </form>
          )}

          {/* 익명 계속 */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="w-full py-2.5 border border-gray-200 text-gray-400 font-semibold rounded-xl text-xs hover:border-gray-300 transition-colors"
            >
              익명으로 계속 사용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
