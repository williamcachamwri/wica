import { useEffect, useRef, useState } from 'react'
import { showToast } from './Toast'

interface BlogInteractionsProps {
  slug: string
  title: string
}

interface Comment {
  id: string
  author: string
  avatar?: string
  body: string
  date: string
  url: string
  parentId?: string
}

function linkifyMentions(text: string): React.ReactNode {
  const parts = text.split(/(@\w[\w.-]*\w)/g)
  return parts.map((part, i) => {
    if (part.startsWith('@') && part.length > 1) {
      const username = part.slice(1)
      return (
        <a key={i} href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="blog-interactions__mention">
          {part}
        </a>
      )
    }
    return part
  })
}

function renderBody(body: string): React.ReactNode {
  return body.split('\n').map((line, i, arr) => (
    <span key={i}>
      {linkifyMentions(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

export function BlogInteractions({ slug, title }: BlogInteractionsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ login: string; avatar?: string } | null>(null)
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionDropdownRef = useRef<HTMLDivElement>(null)

  const knownAuthors = [...new Set(comments.map(c => c.author))].sort()

  const filteredMentions = mentionQuery
    ? knownAuthors.filter(a => a.toLowerCase().includes(mentionQuery.toLowerCase()))
    : knownAuthors

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/user')
      if (res.ok) {
        const data = (await res.json()) as { login: string; avatar?: string }
        setUser(data)
      }
    } catch {
      // not authenticated
    }
  }

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/auth/blog/comment?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`)
      if (!res.ok) throw new Error('Failed to load comments')
      const data = (await res.json()) as { comments: Comment[]; likes: number }
      setComments(data.comments)
      setLikes(data.likes)
      if (user) {
        const hasLiked = await checkLiked()
        setLiked(hasLiked)
      }
    } catch {
      showToast('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
    checkAuth()
  }, [slug, title])

  useEffect(() => {
    if (user) {
      checkLiked().then(setLiked)
    } else {
      setLiked(false)
    }
  }, [user, slug, title])

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyTo])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(e.target as Node)) {
        setMentionQuery('')
        setMentionIndex(-1)
      }
    }
    if (mentionQuery) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mentionQuery])

  const checkLiked = async (): Promise<boolean> => {
    if (!user) return false
    try {
      const res = await fetch(`/api/auth/blog/like/status?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`)
      if (!res.ok) return false
      const data = (await res.json()) as { liked: boolean }
      return data.liked
    } catch {
      return false
    }
  }

  const handleLogin = () => {
    const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
    window.location.href = `/api/auth/github?redirect=${redirect}`
  }

  const handleLogout = () => {
    const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
    window.location.href = `/api/auth/github/logout?redirect=${redirect}`
  }

  const handleLike = async () => {
    if (!user) {
      handleLogin()
      return
    }
    try {
      const res = await fetch('/api/auth/blog/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title }),
      })
      if (!res.ok) throw new Error('Failed to like')
      const data = (await res.json()) as { liked: boolean; count: number }
      setLikes(data.count)
      setLiked(data.liked)
      showToast(data.liked ? 'Liked!' : 'Unliked')
    } catch {
      showToast('Failed to update like')
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setCommentBody(val)

    const textBeforeCursor = val.slice(0, e.target.selectionStart)
    const atIdx = textBeforeCursor.lastIndexOf('@')
    if (atIdx >= 0 && (atIdx === 0 || textBeforeCursor[atIdx - 1] === ' ' || textBeforeCursor[atIdx - 1] === '\n')) {
      const query = textBeforeCursor.slice(atIdx + 1)
      if (/^[\w.-]*$/.test(query) && query.length > 0) {
        setMentionQuery(query)
        setMentionIndex(0)
        return
      }
    }
    setMentionQuery('')
    setMentionIndex(-1)
  }

  const insertMention = (username: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const textBefore = commentBody.slice(0, pos)
    const atIdx = textBefore.lastIndexOf('@')
    const beforeAt = commentBody.slice(0, atIdx)
    const afterAt = commentBody.slice(pos)
    const newVal = beforeAt + `@${username} ` + afterAt
    setCommentBody(newVal)
    setMentionQuery('')
    setMentionIndex(-1)
    const newCursor = atIdx + username.length + 2
    setTimeout(() => { ta.setSelectionRange(newCursor, newCursor); ta.focus() }, 0)
  }

  const handleMentionKeyDown = (e: React.KeyboardEvent) => {
    if (!mentionQuery) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex(i => Math.min(i + 1, filteredMentions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filteredMentions[mentionIndex]) {
        e.preventDefault()
        insertMention(filteredMentions[mentionIndex])
      }
    } else if (e.key === 'Escape') {
      setMentionQuery('')
      setMentionIndex(-1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/blog/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          body: commentBody.trim(),
          ...(replyTo ? { replyTo: replyTo.id } : {}),
        }),
      })
      if (!res.ok) throw new Error('Failed to post comment')
      const comment = (await res.json()) as Comment
      setComments((prev) => [comment, ...prev])
      setCommentBody('')
      setReplyTo(null)
      showToast('Comment posted')
    } catch {
      showToast('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const topLevelComments = comments.filter(c => !c.parentId)
  const replyMap = new Map<string, Comment[]>()
  for (const c of comments) {
    if (c.parentId) {
      if (!replyMap.has(c.parentId)) replyMap.set(c.parentId, [])
      replyMap.get(c.parentId)!.push(c)
    }
  }

  return (
    <section className="blog-interactions">
      <div className="blog-interactions__header">
        <button
          type="button"
          className={`blog-interactions__like ${liked ? 'blog-interactions__like--liked' : ''}`}
          onClick={handleLike}
          aria-label="Like this post"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {liked ? 'Liked' : likes > 0 ? likes : 'Like'}
        </button>

        {user ? (
          <div className="blog-interactions__user">
            {user.avatar && <img src={user.avatar} alt="" className="blog-interactions__avatar" />}
            <span className="blog-interactions__name">{user.login}</span>
            <button type="button" className="blog-interactions__auth-link" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <button type="button" className="blog-interactions__auth-link" onClick={handleLogin}>
            Sign in with GitHub to comment
          </button>
        )}
      </div>

      {user && !replyTo && (
        <form onSubmit={handleSubmit} className="blog-interactions__form">
          <div className="blog-interactions__textarea-wrapper">
            <textarea
              ref={textareaRef}
              value={commentBody}
              onChange={handleTextareaChange}
              onKeyDown={handleMentionKeyDown}
              placeholder="Write a comment…"
              rows={3}
              disabled={submitting}
              className="blog-interactions__input"
            />
            {mentionQuery && filteredMentions.length > 0 && (
              <div className="blog-interactions__mentions" ref={mentionDropdownRef}>
                {filteredMentions.slice(0, 8).map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    className={`blog-interactions__mentions-item ${i === mentionIndex ? 'blog-interactions__mentions-item--active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(name) }}
                  >
                    @{name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || !commentBody.trim()}
            className="blog-interactions__submit"
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      )}

      <div className="blog-interactions__comments">
        {loading ? (
          <div className="guestbook-skeleton" aria-busy="true" aria-label="Loading comments">
            <div className="guestbook-skeleton__item">
              <div className="guestbook-skeleton__avatar" />
              <div className="guestbook-skeleton__content">
                <div className="guestbook-skeleton__line" />
                <div className="guestbook-skeleton__line guestbook-skeleton__line--short" />
                <div className="guestbook-skeleton__line guestbook-skeleton__line--meta" />
              </div>
            </div>
            <div className="guestbook-skeleton__item">
              <div className="guestbook-skeleton__avatar" />
              <div className="guestbook-skeleton__content">
                <div className="guestbook-skeleton__line" />
                <div className="guestbook-skeleton__line guestbook-skeleton__line--meta" />
              </div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <p className="blog-interactions__empty">No comments yet. Be the first.</p>
        ) : (
          topLevelComments.map((comment) => {
            const replyIds = [comment.id, ...(replyMap.get(comment.id)?.map(r => r.id) || [])]
            const showReplyForm = user && replyTo && replyIds.includes(replyTo.id)
            return (
            <div key={comment.id} className="blog-interactions__thread">
              <CommentCard comment={comment}>
                {user && (
                  <button
                    type="button"
                    className="blog-interactions__reply-btn"
                    onClick={() => { setReplyTo({ id: comment.id, author: comment.author }); setCommentBody('') }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 17 4 12 9 7" />
                      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    </svg>
                    Reply
                  </button>
                )}
              </CommentCard>
              <div className="blog-interactions__replies">
                {replyMap.get(comment.id)?.map(reply => (
                  <CommentCard key={reply.id} comment={reply} isReply>
                    {user && (
                      <button
                        type="button"
                        className="blog-interactions__reply-btn"
                        onClick={() => { setReplyTo({ id: reply.id, author: reply.author }); setCommentBody(`@${reply.author} `) }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 17 4 12 9 7" />
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                        </svg>
                        Reply
                      </button>
                    )}
                  </CommentCard>
                ))}
                {showReplyForm && (
                  <ReplyForm
                    replyTo={replyTo}
                    commentBody={commentBody}
                    setCommentBody={setCommentBody}
                    submitting={submitting}
                    textareaRef={textareaRef as any}
                    mentionQuery={mentionQuery}
                    mentionIndex={mentionIndex}
                    filteredMentions={filteredMentions}
                    mentionDropdownRef={mentionDropdownRef as any}
                    handleTextareaChange={handleTextareaChange}
                    handleMentionKeyDown={handleMentionKeyDown}
                    insertMention={insertMention}
                    handleSubmit={handleSubmit}
                    onCancel={() => { setReplyTo(null); setCommentBody('') }}
                  />
                )}
              </div>
            </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function CommentCard({ comment, isReply, children }: { comment: Comment; isReply?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`blog-interactions__comment ${isReply ? 'blog-interactions__comment--reply' : ''}`}>
      <div className="blog-interactions__comment-meta">
        {comment.avatar && (
          <img src={comment.avatar} alt="" className="blog-interactions__comment-avatar" />
        )}
        <span className="blog-interactions__comment-author">{comment.author}</span>
        <span className="blog-interactions__comment-date">
          {new Date(comment.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="blog-interactions__comment-body">{renderBody(comment.body)}</div>
      {children}
    </div>
  )
}

function ReplyForm({
  replyTo, commentBody, setCommentBody, submitting, textareaRef,
  mentionQuery, mentionIndex, filteredMentions, mentionDropdownRef,
  handleTextareaChange, handleMentionKeyDown, insertMention, handleSubmit, onCancel,
}: {
  replyTo: { id: string; author: string }
  commentBody: string
  setCommentBody: (v: string) => void
  submitting: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  mentionQuery: string
  mentionIndex: number
  filteredMentions: string[]
  mentionDropdownRef: React.RefObject<HTMLDivElement | null>
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleMentionKeyDown: (e: React.KeyboardEvent) => void
  insertMention: (name: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
}) {
  return (
    <form onSubmit={handleSubmit} className="blog-interactions__form blog-interactions__form--inline">
      <div className="blog-interactions__reply-indicator">
        <span>Replying to <strong>@{replyTo.author}</strong></span>
        <button type="button" className="blog-interactions__reply-cancel" onClick={onCancel}>Cancel</button>
      </div>
      <div className="blog-interactions__textarea-wrapper">
        <textarea
          ref={textareaRef}
          value={commentBody}
          onChange={handleTextareaChange}
          onKeyDown={handleMentionKeyDown}
          placeholder={`Reply to @${replyTo.author}…`}
          rows={2}
          disabled={submitting}
          className="blog-interactions__input"
        />
        {mentionQuery && filteredMentions.length > 0 && (
          <div className="blog-interactions__mentions" ref={mentionDropdownRef}>
            {filteredMentions.slice(0, 8).map((name, i) => (
              <button
                key={name}
                type="button"
                className={`blog-interactions__mentions-item ${i === mentionIndex ? 'blog-interactions__mentions-item--active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); insertMention(name) }}
              >@{name}</button>
            ))}
          </div>
        )}
      </div>
      <div className="blog-interactions__form-actions">
        <button type="submit" disabled={submitting || !commentBody.trim()} className="blog-interactions__submit">
          {submitting ? 'Posting…' : 'Reply'}
        </button>
        <button type="button" className="blog-interactions__form-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
