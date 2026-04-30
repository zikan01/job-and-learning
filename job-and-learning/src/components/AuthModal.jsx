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

// reason: 권한 가드에서 모달을 여는 경우 사유 문자열
export default function AuthModal({ open, onClose, onSuccess, reason }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'done'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const emailValid = EMAIL_RE.test(email.trim())
  const passwordValid = password.length >= 6
  const canSubmit = emailValid && passwordValid && !loading

  function handleClose() {
    setMode('login')
    setEmail('')
    setPassword('')
    setError('')
    setLoading(false)
    onClose()
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (err) {
      setError(friendlyError(err.message))
    } else {
      handleClose()
      onSuccess?.()
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (err) {
      setError(friendlyError(err.message))
    } else {
      setMode('done')
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
              {reason ? '로그인 필요' : mode === 'signup' ? '회원가입' : '로그인'}
            </p>
            <h3 className="font-outfit font-black text-white text-xl">
              {mode === 'done'
                ? '이메일을 확인해주세요'
                : reason
                ? '로그인이 필요합니다'
                : mode === 'signup'
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

        <div className="px-6 py-6">

          {/* 가입 완료 화면 */}
          {mode === 'done' ? (
            <div className="text-center py-4 space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="font-bold text-[#1a3a5f]">{email}</span>로<br />
                인증 링크를 보내드렸습니다.<br />
                메일을 확인하고 링크를 클릭하면 로그인됩니다.
              </p>
              <button
                onClick={() => switchMode('login')}
                className="w-full py-3 bg-[#1a3a5f] text-white font-bold rounded-xl text-sm hover:bg-[#243f6a] transition-colors"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* 권한 가드 사유 표시 */}
              {reason && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl">
                  {reason}
                </div>
              )}

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-bold text-[#1a3a5f] uppercase tracking-wide mb-1.5">
                  이메일
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

              {/* 비밀번호 */}
              <div>
                <label className="block text-xs font-bold text-[#1a3a5f] uppercase tracking-wide mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="6자 이상"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a3a5f] focus:ring-2 focus:ring-[#1a3a5f]/10 transition-all"
                />
              </div>

              {/* 에러 */}
              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl">{error}</div>
              )}

              {/* 로그인 버튼 */}
              {mode === 'login' ? (
                <>
                  <button
                    onClick={handleLogin}
                    disabled={!canSubmit}
                    className="w-full py-3.5 bg-[#1a3a5f] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#243f6a] transition-colors"
                  >
                    {loading ? '로그인 중…' : '로그인 →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="w-full py-3 border-2 border-[#1a3a5f]/20 text-[#1a3a5f] font-bold rounded-xl text-sm hover:border-[#1a3a5f]/40 hover:bg-[#1a3a5f]/5 transition-colors"
                  >
                    처음이신가요? 회원가입하기 →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignup}
                    disabled={!canSubmit}
                    className="w-full py-3.5 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#e07d00] transition-colors"
                  >
                    {loading ? '처리 중…' : '이메일 인증 후 가입하기 →'}
                  </button>
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
