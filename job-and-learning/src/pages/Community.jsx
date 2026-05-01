import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'

const BOARD_VALUES = ['전체', '소모임', '자유게시판', '정보공유']
const BOARD_DB_VALUES = ['자유게시판', '소모임', '정보공유']

export default function Community({ user, lang, onLoginRequired }) {
  const tr = t[lang] ?? t.ko
  const ct = tr.community
  const isAnon = !user || user.is_anonymous

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState('전체')
  const [commentCounts, setCommentCounts] = useState({})

  // 상세 + 댓글
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  // 글쓰기
  const [showWrite, setShowWrite] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', board: '자유게시판' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchPosts()
    const channel = supabase
      .channel('community-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, fetchPosts)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    if (selectedPost) {
      setComments([])
      setCommentText('')
      fetchComments(selectedPost.id)
    }
  }, [selectedPost?.id])

  async function fetchPosts() {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
    if (data?.length) {
      const { data: counts } = await supabase
        .from('community_comments')
        .select('post_id')
        .in('post_id', data.map(p => p.id))
      const map = {}
      counts?.forEach(r => { map[r.post_id] = (map[r.post_id] ?? 0) + 1 })
      setCommentCounts(map)
    }
  }

  async function fetchComments(postId) {
    const { data } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    if (isAnon) { onLoginRequired?.('댓글을 작성하려면 로그인이 필요합니다.'); return }
    setCommentSubmitting(true)
    const { error } = await supabase.from('community_comments').insert({
      post_id: selectedPost.id,
      user_id: user.id,
      content: commentText.trim(),
    })
    setCommentSubmitting(false)
    if (!error) {
      setCommentText('')
      fetchComments(selectedPost.id)
      setCommentCounts(prev => ({ ...prev, [selectedPost.id]: (prev[selectedPost.id] ?? 0) + 1 }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) { showToast(ct.toastValidate); return }
    if (!user) { showToast(tr.loginRequired); return }
    setSubmitting(true)
    const { error } = await supabase.from('community_posts').insert({
      title: form.title, content: form.content, board: form.board,
      user_id: user.id, author_email: user.email ?? '익명',
    })
    setSubmitting(false)
    if (!error) {
      setForm({ title: '', content: '', board: '자유게시판' })
      setShowWrite(false)
      showToast(ct.toastSuccess)
    } else {
      showToast(ct.toastError)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = board === '전체' ? posts : posts.filter(p => p.board === board)

  const boardLabel = val => {
    const idx = BOARD_VALUES.indexOf(val)
    return idx >= 0 ? ct.boardLabels[idx] : val
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-outfit font-black text-[#002147] text-xl">{ct.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{ct.subtitle}</p>
        </div>
        <button
          onClick={() => {
            if (isAnon) { onLoginRequired?.(ct.loginPrompt); return }
            setShowWrite(true)
          }}
          className="bg-[#FF8C00] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95">
          {ct.writeBtn}
        </button>
      </div>

      {/* 게시판 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {BOARD_VALUES.map((val, i) => (
          <button key={val} onClick={() => setBoard(val)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              board === val ? 'bg-[#002147] text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
            {ct.boardLabels[i]}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-400 text-sm whitespace-pre-line">{ct.noResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#002147]/10 text-[#002147] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {boardLabel(post.board ?? '자유게시판')}
                    </span>
                    {commentCounts[post.id] > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#FF8C00] bg-[#FF8C00]/10 px-1.5 py-0.5 rounded-full">
                        💬 {commentCounts[post.id]}
                      </span>
                    )}
                  </div>
                  <div className="font-outfit font-bold text-[#002147] text-sm leading-tight">{post.title}</div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                  <div className="text-[10px] text-gray-300 mt-2">
                    {post.author_email?.split('@')[0] ?? tr.anonymous} · {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 게시글 상세 + 댓글 모달 */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="bg-[#002147] px-5 py-4 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-white/20 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                  {boardLabel(selectedPost.board ?? '자유게시판')}
                </span>
                <h2 className="font-outfit font-black text-white text-base leading-snug">{selectedPost.title}</h2>
                <p className="text-white/40 text-[10px] mt-1">
                  {selectedPost.author_email?.split('@')[0] ?? tr.anonymous} · {new Date(selectedPost.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-white/60 hover:text-white text-2xl leading-none flex-shrink-0 transition-colors">×</button>
            </div>

            {/* 본문 + 댓글 스크롤 영역 */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* 본문 */}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>

              {/* 댓글 구분선 */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-[#002147] mb-3">
                  💬 댓글 {comments.length > 0 ? `(${comments.length})` : ''}
                </p>
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ) : (
                  <div className="space-y-2.5">
                    {comments.map(c => (
                      <div key={c.id} className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#002147]">
                            {c.user_id === selectedPost.user_id ? '✍️ 작성자' : '💬 댓글'}
                          </span>
                          <span className="text-[10px] text-gray-300">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 댓글 입력 */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                placeholder={isAnon ? '로그인 후 댓글을 작성하세요' : '댓글을 입력하세요'}
                disabled={isAnon}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={handleAddComment}
                disabled={isAnon || !commentText.trim() || commentSubmitting}
                className="px-4 py-2.5 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-40 hover:bg-[#e07d00] transition-colors flex-shrink-0"
              >
                {commentSubmitting ? '…' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 글쓰기 모달 */}
      {showWrite && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && setShowWrite(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-black text-[#002147] text-lg">{ct.writeTitle}</h3>
              <button onClick={() => setShowWrite(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.board} onChange={e => setForm(p => ({ ...p, board: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00]">
                {BOARD_DB_VALUES.map((val, i) => (
                  <option key={val} value={val}>{ct.boardOptions[i]}</option>
                ))}
              </select>
              <input type="text" placeholder={ct.placeholderTitle} value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10" />
              <textarea placeholder={ct.placeholderContent} value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10 resize-none" />
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-[#FF8C00] text-white font-bold rounded-xl text-sm disabled:opacity-60">
                {submitting ? ct.submitting : ct.submitBtn}
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
