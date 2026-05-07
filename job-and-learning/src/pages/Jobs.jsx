import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

// DB에 저장된 한국어 값 (필터 비교용)
const CATEGORY_VALUES = ['전체', '서비스업', '유통', '사무보조', '스포츠', '기타']
const LOCATION_VALUES = ['전체 지역', '대전 유성구', '대전 서구', '대전 중구', '대전 동구', '대전 대덕구']

// lang에 맞는 DB 컬럼 선택, 없으면 한국어 fallback
const loc = (item, field, lang) => {
  if (lang === 'en' && item[`${field}_en`]) return item[`${field}_en`]
  if (lang === 'vi' && item[`${field}_vi`]) return item[`${field}_vi`]
  if (lang === 'ja' && item[`${field}_ja`]) return item[`${field}_ja`]
  return item[field]
}

export default function Jobs({ user, lang, onLoginRequired }) {
  const tr = t[lang] ?? t.ko
  const jt = tr.jobs
  const isAnon = !user || user.is_anonymous

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('전체')
  const [location, setLocation] = useState('전체 지역')
  const [visaOnly, setVisaOnly] = useState(false)
  const [applyModal, setApplyModal] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(new Set())
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchJobs()
    fetchMyApplications()
    const channel = supabase
      .channel('jobs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchJobs)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
    setJobs(data ?? [])
    setLoading(false)
  }

  async function fetchMyApplications() {
    if (!user) return
    const { data } = await supabase.from('applications').select('job_id').eq('user_id', user.id)
    setApplied(new Set(data?.map(a => a.job_id) ?? []))
  }

  async function handleApply() {
    if (!user || !applyModal) return
    setApplying(true)
    const { error } = await supabase.from('applications').insert({ job_id: applyModal.id, user_id: user.id })
    setApplying(false)
    if (!error) {
      setApplied(prev => new Set([...prev, applyModal.id]))
      setApplyModal(null)
      showToast(jt.toastSuccess)
    } else if (error.code === '23505') {
      showToast(jt.toastDuplicate)
    } else {
      showToast(jt.toastError)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = jobs.filter(j => {
    if (category !== '전체' && j.category !== category) return false
    if (visaOnly && !j.visa_ok) return false
    if (location !== '전체 지역' && j.location !== location) return false
    return true
  })

  const daysLeft = deadline => {
    if (!deadline) return null
    return Math.ceil((new Date(deadline) - new Date()) / 86400000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="mb-4">
        <h1 className="font-outfit font-black text-[#002147] text-xl">{jt.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{jt.subtitle}</p>
      </div>

      {/* S-3 비자 + 지역 필터 */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setVisaOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
            visaOnly ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          <span>✅</span>
          <span>{jt.visaFilter}</span>
        </button>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 outline-none bg-white"
        >
          {LOCATION_VALUES.map((val, i) => (
            <option key={val} value={val}>{jt.locationLabels[i]}</option>
          ))}
        </select>
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
            {jt.categoryLabels[i]}
          </button>
        ))}
      </div>

      {/* 공고 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💼</div>
          <p className="text-gray-400 text-sm">{jt.noResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => {
            const left = daysLeft(job.deadline)
            const isApplied = applied.has(job.id)
            return (
              <div key={job.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-[#FF8C00]/10 text-[#FF8C00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {jt.categoryLabels[CATEGORY_VALUES.indexOf(job.category)] ?? job.category}
                      </span>
                      {job.visa_ok && (
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {jt.visa}
                        </span>
                      )}
                      {left !== null && (
                        <span className={`text-[10px] font-semibold ${left <= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                          {left > 0 ? `D-${left}` : jt.closed}
                        </span>
                      )}
                    </div>
                    <div className="font-outfit font-bold text-[#002147] text-base leading-tight">{loc(job, 'title', lang)}</div>
                    <div className="text-xs text-gray-500 mt-1">{job.company}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>📍 {job.location}</span>
                      {job.deadline && <span>📅 {job.deadline}</span>}
                    </div>
                    {job.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{loc(job, 'description', lang)}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-outfit font-black text-[#FF8C00] text-lg leading-none">
                        {job.hourly_wage?.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-[10px]">{jt.perHour}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (isApplied) return
                        if (isAnon) { onLoginRequired?.(jt.loginPrompt); return }
                        setApplyModal(job)
                      }}
                      disabled={isApplied}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isApplied
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#002147] text-white hover:bg-[#003166] active:scale-95'
                      }`}
                    >
                      {isApplied ? jt.appliedBtn : jt.applyBtn}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 지원 모달 */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-[#FF8C00]/10 text-[#FF8C00] text-xs font-bold px-3 py-1 rounded-full">{jt.applyConfirm}</span>
              <button onClick={() => setApplyModal(null)} className="text-gray-400 text-xl leading-none">×</button>
            </div>
            <h3 className="font-outfit font-black text-[#002147] text-xl mb-1">{loc(applyModal, 'title', lang)}</h3>
            <p className="text-gray-500 text-sm mb-1">{applyModal.company} · {applyModal.location}</p>
            <p className="text-[#FF8C00] font-bold text-lg mb-4">{applyModal.hourly_wage?.toLocaleString()}{jt.perHour}</p>
            {applyModal.description && (
              <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3 mb-4">{loc(applyModal, 'description', lang)}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setApplyModal(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm font-semibold">
                {tr.cancel}
              </button>
              <button onClick={handleApply} disabled={applying} className="flex-1 py-3 bg-[#FF8C00] text-white rounded-xl text-sm font-bold disabled:opacity-60">
                {applying ? jt.applying : `${jt.applyBtn} →`}
              </button>
            </div>
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
