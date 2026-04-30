import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

// DB 저장 값 (필터 비교용)
const CATEGORY_VALUES = ['전체', '생활용품', '가전', '도서', '의류', '식품', '기타']
const CONDITION_VALUES = ['새상품', '양호', '보통']

export default function Market({ user, lang, onLoginRequired }) {
  const tr = t[lang] ?? t.ko
  const mt = tr.market
  const isAnon = !user || user.is_anonymous

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('전체')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', price: '', description: '', category: '생활용품', condition: '양호', image_url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchPosts()
    const channel = supabase
      .channel('market-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_posts' }, fetchPosts)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchPosts() {
    const { data } = await supabase.from('market_posts').select('*').eq('is_sold', false).order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { showToast(mt.toastLogin); return }
    if (!form.title || !form.price) { showToast(mt.toastValidate); return }
    setSubmitting(true)
    const { error } = await supabase.from('market_posts').insert({
      user_id: user.id,
      title: form.title,
      price: parseInt(form.price),
      description: form.description,
      category: form.category,
      condition: form.condition,
      image_url: form.image_url || null,
    })
    setSubmitting(false)
    if (!error) {
      setShowModal(false)
      setForm({ title: '', price: '', description: '', category: '생활용품', condition: '양호', image_url: '' })
      showToast(mt.toastSuccess)
    } else {
      showToast(mt.toastError)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = category === '전체' ? posts : posts.filter(p => p.category === category)

  const conditionLabel = val => mt.conditionLabels[CONDITION_VALUES.indexOf(val)] ?? val

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-outfit font-black text-[#002147] text-xl">{mt.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{mt.subtitle}</p>
        </div>
        <button
          onClick={() => {
            if (isAnon) { onLoginRequired?.('중고 거래 등록은 로그인이 필요합니다.'); return }
            setShowModal(true)
          }}
          className="bg-[#FF8C00] text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md hover:bg-[#e07d00] active:scale-95 transition-all"
        >
          {mt.postBtn}
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {CATEGORY_VALUES.map((val, i) => (
          <button
            key={val}
            onClick={() => setCategory(val)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              category === val ? 'bg-[#002147] text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {mt.categoryLabels[i]}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-gray-400 text-sm">{mt.noResults}</p>
          <button
            onClick={() => {
              if (isAnon) { onLoginRequired?.('중고 거래 등록은 로그인이 필요합니다.'); return }
              setShowModal(true)
            }}
            className="mt-4 text-[#FF8C00] font-bold text-sm"
          >
            {mt.firstPost}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-36 bg-gray-100 flex items-center justify-center relative">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
                <span className="absolute top-2 right-2 bg-white/90 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {conditionLabel(post.condition)}
                </span>
              </div>
              <div className="p-3">
                <div className="text-[10px] text-gray-400 mb-0.5">
                  {mt.categoryLabels[CATEGORY_VALUES.indexOf(post.category)] ?? post.category}
                </div>
                <div className="font-semibold text-[#002147] text-sm leading-tight line-clamp-2">{post.title}</div>
                <div className="font-outfit font-black text-[#FF8C00] text-base mt-1">{post.price?.toLocaleString()}원</div>
                {post.description && (
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{post.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 등록 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="bg-[#FF8C00]/10 text-[#FF8C00] text-xs font-bold px-3 py-1 rounded-full">{mt.modalBadge}</span>
                <h3 className="font-outfit font-black text-[#002147] text-xl mt-2">{mt.modalTitle}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">{mt.labelName}</label>
                <input name="title" value={form.title} onChange={change}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                  placeholder={mt.placeholderName} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">{mt.labelPrice}</label>
                  <input type="number" name="price" value={form.price} onChange={change}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                    placeholder="50000" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">{mt.labelCondition}</label>
                  <select name="condition" value={form.condition} onChange={change}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] bg-white">
                    {CONDITION_VALUES.map((val, i) => (
                      <option key={val} value={val}>{mt.conditionLabels[i]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">{mt.labelCategory}</label>
                <select name="category" value={form.category} onChange={change}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] bg-white">
                  {CATEGORY_VALUES.filter(v => v !== '전체').map((val, i) => (
                    <option key={val} value={val}>{mt.categoryLabels[i + 1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">{mt.labelImageUrl}</label>
                <input name="image_url" value={form.image_url} onChange={change}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold text-[#002147] uppercase tracking-wide">{mt.labelDesc}</label>
                <textarea name="description" value={form.description} onChange={change} rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] resize-none"
                  placeholder={mt.placeholderDesc} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-60 hover:bg-[#e07d00] transition-colors">
                {submitting ? mt.submitting : mt.submitBtn}
              </button>
            </form>
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
