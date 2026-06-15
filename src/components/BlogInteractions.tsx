import { useEffect, useState } from 'react'
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
}

export function BlogInteractions({ slug, title }: BlogInteractionsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ login: string; avatar?: string } | null>(null)

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
      const res = await fetch(`/api/blog/comment?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`)
      if (!res.ok) throw new Error('Failed to load comments')
      const data = (await res.json()) as { comments: Comment[]; likes: number }
      setComments(data.comments)
      setLikes(data.likes)
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
      const res = await fetch('/api/blog/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title }),
      })
      if (!res.ok) {
        if (res.status === 409) {
          await loadComments()
          showToast('You already liked this post')
          return
        }
        throw new Error('Failed to like')
      }
      const data = (await res.json()) as { count: number }
      setLikes(data.count)
      showToast('Liked!')
    } catch {
      showToast('Failed to like')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/blog/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, body: commentBody.trim() }),
      })
      if (!res.ok) throw new Error('Failed to post comment')
      const comment = (await res.json()) as Comment
      setComments((prev) => [comment, ...prev])
      setCommentBody('')
      showToast('Comment posted')
    } catch {
      showToast('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="blog-interactions">
      <div className="blog-interactions__header">
        <button
          type="button"
          className="blog-interactions__like"
          onClick={handleLike}
          aria-label="Like this post"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={likes > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likes > 0 ? likes : 'Like'}
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

      {user && (
        <form onSubmit={handleSubmit} className="blog-interactions__form">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            disabled={submitting}
            className="blog-interactions__input"
          />
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
          <p className="blog-interactions__empty">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="blog-interactions__empty">No comments yet. Be the first.</p>
        ) : (
          comments.map((comment) => (
            <a
              key={comment.id}
              href={comment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-interactions__comment"
            >
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
              <p className="blog-interactions__comment-body">{comment.body}</p>
            </a>
          ))
        )}
      </div>
    </section>
  )
}
