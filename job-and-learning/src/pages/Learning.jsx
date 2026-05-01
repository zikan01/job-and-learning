import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

// DB 저장 값 (필터 비교용)
const TAB_VALUES = ['전체', 'AI 실무(Vibe Coding)', '한국 생활 가이드']
const LEVEL_KEYS = ['입문', '초급', '중급']
const LEVEL_STYLES = { '입문': 'bg-emerald-100 text-emerald-700', '초급': 'bg-blue-100 text-blue-700', '중급': 'bg-purple-100 text-purple-700' }

export default function Learning({ user, lang, onLoginRequired }) {
  const tr = t[lang] ?? t.ko
  const lt = tr.learning
  const isAnon = !user || user.is_anonymous

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('전체')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
      setCourses(data ?? [])
      setLoading(false)
    }
    load()
    const channel = supabase
      .channel('courses-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = activeTab === '전체' ? courses : courses.filter(c => c.category === activeTab)

  const catCounts = {
    '전체': courses.length,
    'AI 실무(Vibe Coding)': courses.filter(c => c.category === 'AI 실무(Vibe Coding)').length,
    '한국 생활 가이드': courses.filter(c => c.category === '한국 생활 가이드').length,
  }

  const catBadge = cat =>
    cat === 'AI 실무(Vibe Coding)' ? lt.catBadge.ai : lt.catBadge.life

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="mb-4">
        <h1 className="font-outfit font-black text-[#002147] text-xl">{lt.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{lt.subtitle}</p>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {TAB_VALUES.map((val, i) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === val ? 'bg-[#002147] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {i === 1 && '🤖 '}
            {i === 2 && '🇰🇷 '}
            {i === 0 && '📚 '}
            {lt.tabLabels[i]}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === val ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {catCounts[val]}
            </span>
          </button>
        ))}
      </div>

      {/* 강의 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-gray-400 text-sm">{lt.noResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  if (isAnon) { onLoginRequired?.('강의 내용은 로그인 후 확인할 수 있습니다.'); return }
                  setExpanded(expanded === course.id ? null : course.id)
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_STYLES[course.level] ?? 'bg-gray-100 text-gray-500'}`}>
                        {lt.levelLabels[course.level] ?? course.level}
                      </span>
                      <span className="bg-[#FF8C00]/10 text-[#FF8C00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {catBadge(course.category)}
                      </span>
                      {course.is_free && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{lt.free}</span>
                      )}
                    </div>
                    <h3 className="font-outfit font-bold text-[#002147] text-base leading-tight">{course.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>👤 {course.instructor}</span>
                      {course.duration_min && <span>⏱ {course.duration_min}{lt.minuteUnit}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {course.video_url && (
                      <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-lg text-center">{lt.video}</span>
                    )}
                    {course.pdf_url && (
                      <span className="bg-blue-50 text-blue-500 text-[10px] font-bold px-2 py-1 rounded-lg text-center">{lt.pdfBadge}</span>
                    )}
                  </div>
                </div>
              </div>

              {expanded === course.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-3">
                  {course.pdf_url ? (
                    <a
                      href={course.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a3a5f] text-white font-bold rounded-xl text-sm hover:bg-[#243f6a] transition-colors"
                    >
                      {lt.pdfDownload}
                    </a>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔜</div>
                      <div className="font-outfit font-bold text-[#002147] text-sm mb-1">{lt.comingSoon}</div>
                      <div className="text-xs text-gray-400">{lt.comingSoonDesc}</div>
                    </div>
                  )}
                  {course.video_url && (
                    <a
                      href={course.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-colors"
                    >
                      ▶ {lt.videoWatch}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 bg-[#002147] rounded-2xl p-5 text-white text-center">
        <div className="text-2xl mb-2">🎓</div>
        <div className="font-outfit font-bold text-base mb-1">{lt.ctaTitle}</div>
        <div className="text-white/50 text-xs mb-3">{lt.ctaDesc}</div>
        <a href="mailto:jal@jobnlearning.kr"
          className="inline-block bg-[#FF8C00] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#e07d00] transition-colors">
          {lt.ctaBtn}
        </a>
      </div>
    </div>
  )
}
