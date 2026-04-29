import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!open) return null

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('이메일과 비밀번호를 입력해주세요.'); return }
    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }

    setLoading(true)
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (err) setError(err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : err.message)
      else onClose()
    } else {
      const { error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (err) setError(err.message)
      else setDone(true)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-slide-up">
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="font-outfit font-black text-[#002147] text-xl mb-2">이메일을 확인해주세요!</h3>
            <p className="text-gray-500 text-sm mb-4">가입 확인 링크를 이메일로 보내드렸습니다.</p>
            <button onClick={onClose} className="w-full py-3 bg-[#002147] text-white font-bold rounded-xl text-sm">
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-outfit font-black text-[#002147] text-xl">
                {mode === 'login' ? '로그인' : '회원가입'}
              </h3>
              <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
            </div>

            {/* 탭 */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              {[['login', '로그인'], ['signup', '회원가입']].map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    mode === m ? 'bg-white text-[#002147] shadow-sm' : 'text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">이메일</label>
                <input
                  type="email" name="email" value={form.email} onChange={change}
                  placeholder="you@email.com"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">비밀번호</label>
                <input
                  type="password" name="password" value={form.password} onChange={change}
                  placeholder="6자 이상"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl">{error}</div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-60 hover:bg-[#e07d00] transition-colors"
              >
                {loading ? '처리 중…' : mode === 'login' ? '로그인 →' : '회원가입 →'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 border border-gray-200 text-gray-400 font-semibold rounded-xl text-xs hover:border-gray-300 transition-colors"
              >
                익명으로 계속 사용하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
