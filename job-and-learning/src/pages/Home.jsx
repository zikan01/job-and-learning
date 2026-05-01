import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

const QUICK_IDS = ['jobs', 'learning', 'market', 'help']
const QUICK_EMOJIS = ['💼', '📚', '🛍️', '🆘']
const QUICK_STYLES = [
  { card: 'bg-[#002147] text-white', sub: 'text-white/50' },
  { card: 'bg-[#FF8C00] text-white', sub: 'text-white/50' },
  { card: 'bg-white border border-gray-200 text-[#002147]', sub: 'text-gray-400' },
  { card: 'bg-white border border-gray-200 text-[#002147]', sub: 'text-gray-400' },
]

/* 캠퍼스 스타일 히어로 배경 — 이미지 URL은 아래 heroStyle에서 교체 가능 */
const heroStyle = {
  backgroundImage: [
    'linear-gradient(135deg, rgba(0,21,56,0.93) 0%, rgba(0,33,71,0.82) 50%, rgba(0,52,120,0.88) 100%)',
    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  ].join(', '),
}

export default function Home({ user, onTabChange, lang }) {
  const tr = t[lang] ?? t.ko
  const isLoggedIn = user && !user.is_anonymous
  const [stats, setStats] = useState({ applications: 0, myPosts: 0, courses: 0 })
  const [recentJobs, setRecentJobs] = useState([])
  const [recentMarket, setRecentMarket] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const promises = [
        supabase.from('jobs').select('id,title,company,hourly_wage,location,deadline,visa_ok').eq('is_active', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('market_posts').select('id,title,price,image_url,category').eq('is_sold', false).order('created_at', { ascending: false }).limit(4),
      ]
      if (isLoggedIn) {
        promises.push(
          supabase.from('applications').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('market_posts').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('courses').select('id', { count: 'exact' }),
        )
      }
      const results = await Promise.all(promises)
      const [jobRes, marketRes, appRes, postRes, courseRes] = results
      setRecentJobs(jobRes.data ?? [])
      setRecentMarket(marketRes.data ?? [])
      if (isLoggedIn) {
        setStats({ applications: appRes.count ?? 0, myPosts: postRes.count ?? 0, courses: courseRes.count ?? 0 })
      }
      setLoading(false)
    }
    load()
  }, [user, isLoggedIn])

  const summaryValues = [stats.applications, stats.myPosts, stats.courses]
  const summaryColors = ['bg-[#FF8C00]', 'bg-[#002147]', 'bg-emerald-500']

  return (
    <div>
      {/* ── 풀 와이드 히어로 배너 ── */}
      <div className="w-full relative overflow-hidden" style={heroStyle}>
        {/* 우측 장식 원 */}
        <div className="absolute right-0 top-0 w-[600px] h-[600px] rounded-full bg-[#FF8C00]/8 -translate-y-40 translate-x-40 pointer-events-none" />
        <div className="absolute right-60 bottom-0 w-80 h-80 rounded-full bg-white/5 translate-y-24 pointer-events-none" />
        {/* 좌측 수직 선 장식 (건물 실루엣 암시) */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF8C00]/30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
          <div className="max-w-2xl">
            {/* 서브 태그 */}
            <div className="inline-flex items-center gap-2 bg-[#FF8C00]/20 text-[#FF8C00] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF8C00] animate-pulse" />
              International Students
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="font-outfit font-black text-4xl lg:text-5xl leading-tight text-white mb-4">
              {tr.hero[0]}<br />
              <span className="text-[#FF8C00]">{tr.hero[1]}</span>
            </h1>
            <p className="text-white/55 text-lg mb-8">{tr.hero[2]}</p>

            {/* 히어로 CTA 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => onTabChange?.('jobs')}
                className="bg-[#FF8C00] hover:bg-[#e07c00] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg"
              >
                💼 {tr.quickActions[0]}
              </button>
              <button
                onClick={() => onTabChange?.('help')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors border border-white/20"
              >
                🆘 {tr.quickActions[3]}
              </button>
            </div>
          </div>
        </div>

        {/* 하단 그라데이션 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </div>

      {/* ── 컨텐츠 영역 (max-w-7xl) ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* 퀵 액션 카드 — 4열 가로 배열 */}
        <section>
          <h2 className="font-outfit font-bold text-[#002147] text-lg mb-4">{tr.quickLabel}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_IDS.map((id, i) => (
              <button
                key={id}
                onClick={() => onTabChange?.(id)}
                className={`${QUICK_STYLES[i].card} rounded-2xl p-6 flex flex-col items-start gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all`}
              >
                <span className="text-3xl">{QUICK_EMOJIS[i]}</span>
                <div>
                  <div className="font-outfit font-black text-base">{tr.quickActions[i]}</div>
                  <div className={`text-xs mt-0.5 ${QUICK_STYLES[i].sub}`}>{tr.quickSub}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 나의 활동 요약 — 로그인한 회원만 표시 */}
        {isLoggedIn && (
          <section>
            <h2 className="font-outfit font-bold text-[#002147] text-lg mb-4">{tr.activityTitle}</h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {summaryValues.map((value, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${summaryColors[i]} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-outfit font-black text-base md:text-lg">{loading ? '…' : value}</span>
                  </div>
                  <div className="text-center md:text-left min-w-0">
                    <div className="font-outfit font-bold text-[#002147] text-sm md:text-base whitespace-nowrap">
                      {loading ? '…' : value}<span className="text-xs md:text-sm font-normal text-gray-400 ml-0.5">{tr.activityUnits[i]}</span>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">{tr.activityItems[i]}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 최신 공고 + 중고 물품 — 데스크탑 2열 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최신 알바 공고 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-bold text-[#002147] text-lg">{tr.recentJobs}</h2>
              <button onClick={() => onTabChange?.('jobs')} className="text-sm text-[#FF8C00] font-semibold hover:underline">
                {tr.viewAll}
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                  {tr.noJobs}
                </div>
              ) : (
                recentJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-[#002147] text-sm">{job.title}</div>
                        {job.visa_ok && (
                          <span className="bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">S-3</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{job.company} · {job.location}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[#FF8C00] font-outfit font-bold text-sm">{tr.pricePrefix}{job.hourly_wage?.toLocaleString()}{tr.priceSuffix}</div>
                      <div className="text-xs text-gray-300">{tr.rateUnit}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 최신 중고 물품 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-bold text-[#002147] text-lg">{tr.recentMarket}</h2>
              <button onClick={() => onTabChange?.('market')} className="text-sm text-[#FF8C00] font-semibold hover:underline">
                {tr.viewAll}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)
              ) : recentMarket.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                  {tr.noMarket}
                </div>
              ) : (
                recentMarket.map(item => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-24 bg-gray-100 flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-700 truncate">{item.title}</div>
                      <div className="text-sm text-[#FF8C00] font-bold mt-0.5">{tr.pricePrefix}{item.price?.toLocaleString()}{tr.priceSuffix}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
