import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LEN = 8

function OtpBoxes({ value, onChange }) {
  const refs = useRef([])
  const digits = Array(OTP_LEN).fill('').map((_, i) => value[i] ?? '')

  function handleChange(i, e) {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    onChange(next.join(''))
    if (v && i < OTP_LEN - 1) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]
        next[i] = ''
        onChange(next.join(''))
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < OTP_LEN - 1) {
      refs.current[i + 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6).split('').map((c, i) => pasted[i] ?? '').join(''))
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, OTP_LEN - 1)
    refs.current[focusIdx]?.focus()
  }

  function handleFocus(e) {
    e.target.select()
  }

  return (
    <div className="flex gap-1.5 justify-center" onPaste={handlePaste}>
      {Array(OTP_LEN).fill(0).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={handleFocus}
          autoFocus={i === 0}
          className={`w-9 h-12 text-center text-xl font-black rounded-xl border-2 outline-none transition-all ${
            digits[i]
              ? 'border-[#1a3a5f] bg-[#1a3a5f]/5 text-[#1a3a5f]'
              : 'border-gray-200 bg-gray-50 text-gray-800'
          } focus:border-[#1a3a5f] focus:bg-white focus:ring-2 focus:ring-[#1a3a5f]/10`}
        />
      ))}
    </div>
  )
}

// reason: 로그인이 필요한 이유 문자열 (없으면 일반 로그인 모달)
export default function AuthModal({ open, onClose, onSuccess, reason }) {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const emailValid = EMAIL_RE.test(email.trim())
  const tokenValid = token.replace(/\D/g, '').length === OTP_LEN

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
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('otp')
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    const code = token.replace(/\D/g, '')
    if (code.length !== OTP_LEN) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
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
              {reason ? '로그인 필요' : step === 'email' ? '간편 로그인' : '인증번호 확인'}
            </p>
            <h3 className="font-outfit font-black text-white text-xl">
              {reason
                ? '회원가입이 필요합니다'
                : step === 'email' ? '이메일로 시작하기' : '코드를 입력해주세요'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">

          {/* Step 1: 이메일 입력 */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {reason && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl">
                  {reason}
                </div>
              )}
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
                {loading ? '전송 중…' : reason ? '간편 가입하기 →' : '인증번호 받기 →'}
              </button>

              <p className="text-center text-xs text-gray-400">
                이메일로 8자리 인증번호를 보내드립니다
              </p>
            </form>
          )}

          {/* Step 2: OTP 6칸 입력 */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* 전송된 이메일 표시 */}
              <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">인증번호 전송됨</p>
                  <p className="text-sm font-semibold text-[#1a3a5f] truncate">{email}</p>
                </div>
              </div>

              {/* 6칸 OTP 입력 */}
              <div>
                <label className="block text-xs font-bold text-[#1a3a5f] uppercase tracking-wide mb-3 text-center">
                  8자리 인증번호
                </label>
                <OtpBoxes value={token} onChange={setToken} />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl text-center">{error}</div>
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
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← 이메일 다시 입력하기
              </button>
            </form>
          )}

          {/* 익명 계속 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
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
