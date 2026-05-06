import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

export default function MyPageModal({ open, onClose, user, onLogout, lang }) {
  const mp = (t[lang] ?? t.ko).mypage
  const [applications, setApplications] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !user) return
    setLoading(true)
    async function load() {
      const [appRes, postRes] = await Promise.all([
        supabase
          .from('applications')
          .select('id, created_at, jobs(title, company)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('community_posts')
          .select('id, title, created_at, board')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      setApplications(appRes.data ?? [])
      setMyPosts(postRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [open, user])

  if (!open) return null

  const initial = user?.email ? user.email[0].toUpperCase() : '유'
  const emailId = user?.email?.split('@')[0] ?? '익명'

  async function handleLogout() {
    await supabase.auth.signOut()
    onClose()
    onLogout?.()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-slide-up overflow-hidden">

        {/* 헤더 */}
        <div className="bg-[#1a3a5f] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">My Page</p>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-lg"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF8C00] flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-white font-outfit font-black text-lg truncate">{emailId}</div>
              <div className="text-white/50 text-xs truncate">{user?.email}</div>
              <span className="inline-block mt-1 bg-[#FF8C00]/20 text-[#FF8C00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {mp.member}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* 지원한 취업 */}
          <section>
            <h3 className="text-xs font-bold text-[#1a3a5f] uppercase tracking-widest mb-3">
              {mp.appliedJobs}
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-5 text-gray-400 text-xs bg-gray-50 rounded-xl">
                {mp.noApplications}
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map(app => (
                  <div key={app.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-2 h-2 rounded-full bg-[#FF8C00] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#1a3a5f] truncate">
                        {app.jobs?.title ?? '공고'}
                      </div>
                      <div className="text-xs text-gray-400">{app.jobs?.company ?? ''}</div>
                    </div>
                    <div className="text-[10px] text-gray-300 flex-shrink-0">
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 작성한 게시글 */}
          <section>
            <h3 className="text-xs font-bold text-[#1a3a5f] uppercase tracking-widest mb-3">
              {mp.myPosts}
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : myPosts.length === 0 ? (
              <div className="text-center py-5 text-gray-400 text-xs bg-gray-50 rounded-xl">
                {mp.noPosts}
              </div>
            ) : (
              <div className="space-y-2">
                {myPosts.map(post => (
                  <div key={post.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-2 h-2 rounded-full bg-[#002147] flex-shrink-0" />
                    <div className="text-sm text-[#1a3a5f] truncate flex-1">{post.title}</div>
                    <div className="text-[10px] text-gray-300 flex-shrink-0">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 준비 중인 창업 아이템 */}
          <section>
            <h3 className="text-xs font-bold text-[#1a3a5f] uppercase tracking-widest mb-3">
              {mp.startupTitle}
            </h3>
            <div className="bg-gradient-to-br from-[#1a3a5f]/5 to-[#FF8C00]/5 border border-dashed border-[#1a3a5f]/20 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-sm font-bold text-[#1a3a5f] mb-1">{mp.startupMgmt}</div>
              <div className="text-xs text-gray-400 whitespace-pre-line">{mp.startupDesc}</div>
            </div>
          </section>

        </div>

        {/* 로그아웃 */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full py-3 border-2 border-red-100 text-red-400 font-bold rounded-xl text-sm hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            {mp.logout}
          </button>
        </div>
      </div>
    </div>
  )
}
