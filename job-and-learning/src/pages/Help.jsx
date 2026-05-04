import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

const HELP_COLORS = [
  { color: 'bg-blue-50 border-blue-100', badge: 'text-blue-600 bg-blue-100', emoji: '📋' },
  { color: 'bg-green-50 border-green-100', badge: 'text-green-600 bg-green-100', emoji: '🏠' },
  { color: 'bg-red-50 border-red-100', badge: 'text-red-600 bg-red-100', emoji: '🏥' },
  { color: 'bg-purple-50 border-purple-100', badge: 'text-purple-600 bg-purple-100', emoji: '⚖️' },
]


export default function Help({ user, lang }) {
  const tr = t[lang] ?? t.ko
  const ht = tr.help

  const [showRequest, setShowRequest] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [form, setForm] = useState({ title: '', detail: '', contact: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState('')

  function openRequest(catId) {
    setSelectedCategory(catId)
    setShowRequest(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { showToast(ht.toastValidate); return }
    if (!user) { showToast(tr.loginRequired); return }
    setSubmitting(true)
    const { error } = await supabase.from('help_requests').insert({
      category: selectedCategory, title: form.title,
      detail: form.detail, contact: form.contact, user_id: user.id,
    })
    setSubmitting(false)
    if (error) console.error('[Help] insert error:', error)
    if (!error) {
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          category: selectedCategory || '미선택',
          title: form.title,
          detail: form.detail || '(없음)',
          contact: form.contact || '(미입력)',
          user_id: user.id,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).catch(err => console.error('[EmailJS] send error:', err))
      setDone(true)
    } else {
      showToast(ht.toastError)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function resetModal() {
    setShowRequest(false)
    setDone(false)
    setForm({ title: '', detail: '', contact: '' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="mb-5">
        <h1 className="font-outfit font-black text-[#002147] text-xl">{ht.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{ht.subtitle}</p>
      </div>

      {/* 긴급 연락처 배너 */}
      <div className="bg-red-500 rounded-2xl p-4 mb-5 flex items-center gap-3">
        <div className="text-2xl">🚨</div>
        <div>
          <div className="font-outfit font-black text-white text-sm">{ht.emergencyTitle}</div>
          <div className="text-white/80 text-xs mt-0.5">{ht.emergencyDesc}</div>
        </div>
      </div>

      {/* 도움 카테고리 */}
      <section className="mb-6">
        <h2 className="font-outfit font-bold text-[#002147] text-sm mb-3">{ht.sectionWhat}</h2>
        <div className="grid grid-cols-2 gap-3">
          {ht.categories.map((cat, i) => (
            <button key={i} onClick={() => openRequest(['visa','housing','health','legal'][i])}
              className={`${HELP_COLORS[i].color} border rounded-2xl p-4 text-left transition-transform active:scale-95`}>
              <div className="text-2xl mb-2">{HELP_COLORS[i].emoji}</div>
              <div className="font-outfit font-bold text-[#002147] text-sm mb-1">{cat.title}</div>
              <div className="text-xs text-gray-500 leading-tight">{cat.desc}</div>
              <div className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${HELP_COLORS[i].badge}`}>
                {ht.requestBtn}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 전문가 연결 */}
      <section>
        <h2 className="font-outfit font-bold text-[#002147] text-sm mb-3">{ht.sectionExperts}</h2>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="text-3xl mb-2">🔜</div>
          <p className="text-sm text-gray-400 whitespace-pre-line">{ht.expertsComingSoon}</p>
        </div>
      </section>

      {/* 도움 요청 모달 */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && resetModal()}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up">
            {done ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-outfit font-black text-[#002147] text-xl mb-2">{ht.doneTitle}</h3>
                <p className="text-gray-500 text-sm mb-1">{ht.doneDesc}</p>
                <p className="text-xs text-gray-400 mb-4">{ht.doneNote}</p>
                <button onClick={resetModal} className="w-full py-3 bg-[#002147] text-white font-bold rounded-xl text-sm">
                  {tr.confirm}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-outfit font-black text-[#002147] text-lg">{ht.modalTitle}</h3>
                  <button onClick={resetModal} className="text-gray-400 text-2xl leading-none">×</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" placeholder={ht.placeholderTitle} value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10" />
                  <textarea placeholder={ht.placeholderDetail} value={form.detail}
                    onChange={e => setForm(p => ({ ...p, detail: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10 resize-none" />
                  <input type="text" placeholder={ht.placeholderContact} value={form.contact}
                    onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10" />
                  <p className="text-[10px] text-gray-400">* {ht.doneNote}</p>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-60">
                    {submitting ? ht.submitting : ht.submitBtn}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#002147] text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  )
}
