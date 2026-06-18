import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'
import { SectionDivider } from '../components/SectionDivider'
import { showToast } from '../components/Toast'

import '../styles/guestbook.css'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      getResponse: (widgetId: string) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface Entry {
  id: string
  message: string
  author: string
  date: string
  url: string
  reactions: Record<string, number>
}

const ALLOWED_REACTIONS = ['👍', '❤️', '😄', '🚀', '👀']
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADkpDYfY0xHNwred'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string) {
  return name.charAt(0).toUpperCase()
}

function avatarClassFromName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return `avatar-tint-${Math.abs(h) % 6}`
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [author, setAuthor] = useState('')
  const [justSent, setJustSent] = useState(false)
  const [activeReaction, setActiveReaction] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  const renderTurnstile = useCallback(() => {
    if (!turnstileRef.current || !window.turnstile) return
    const isDark = document.documentElement.classList.contains('dark')
    widgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: SITE_KEY,
      theme: isDark ? 'dark' : 'light',
      size: 'flexible',
    })
  }, [])

  useEffect(() => {
    if (window.turnstile) {
      renderTurnstile()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = renderTurnstile
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [renderTurnstile])

  useEffect(() => {
    fetch('/api/guestbook')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleReact = async (entryId: string, emoji: string) => {
    setActiveReaction(`${entryId}-${emoji}`)
    setTimeout(() => setActiveReaction(null), 400)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discussionId: entryId, emoji }),
      })
      if (!res.ok) throw new Error('Failed to react')
      const updated = (await res.json()) as Entry
      setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)))
    } catch {
      showToast('Failed to react')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text || sending) return
    if (!window.turnstile || !widgetId.current) {
      showToast('Please complete the captcha')
      return
    }

    const turnstileToken = window.turnstile.getResponse(widgetId.current)
    if (!turnstileToken) {
      showToast('Please complete the captcha')
      return
    }

    setSending(true)
    setJustSent(false)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          author: author.trim() || 'anonymous',
          turnstileToken,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send')
      }
      setMessage('')
      setAuthor('')
      setJustSent(true)
      window.turnstile.reset(widgetId.current)
      setTimeout(() => setJustSent(false), 2000)
      const entry = (await res.json()) as Entry
      setEntries((prev) => [entry, ...prev])
      showToast('Sent!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="app-shell app-shell--in">
      <SEO
        title="Guestbook"
        description="Leave a trace — a thought, a joke, a hello."
        pathname="/guestbook"
      />
      <div className="grain" aria-hidden="true" />

      <main id="main" className="max-w-[620px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-10">
          <Link to="/" className="inline-link text-sm mb-6 inline-block">
            ‹ back home
          </Link>
          <h1 className="name-title text-[clamp(1.75rem,6vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1]">
            Guestbook
          </h1>
          <p className="mt-2 text-muted text-lg leading-[1.7]">
            Leave a trace — a thought, a joke, a hello. <br />
            <span className="text-sm">
              {entries.length > 0
                ? `${entries.length} message${entries.length !== 1 ? 's' : ''} so far`
                : 'No messages yet. Be the first.'}
            </span>
          </p>
        </section>

        <section className="mb-14">
          <SectionDivider label="Drop a note" />
          <form onSubmit={handleSubmit} className={`guestbook-form ${justSent ? 'guestbook-form--sent' : ''}`}>
            <div className="guestbook-form__card">
              <div className="guestbook-form__field">
                <input
                  id="name"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  maxLength={32}
                  disabled={sending}
                  className="guestbook-form__input guestbook-form__input--name"
                />
                <textarea
                  id="msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something…"
                  maxLength={280}
                  rows={3}
                  disabled={sending}
                  className="guestbook-form__input"
                />
                <div className="guestbook-form__toolbar">
                  <div ref={turnstileRef} className="guestbook-form__captcha" />
                  <div className="guestbook-form__actions">
                    <span className={`guestbook-form__count ${message.length >= 260 ? 'guestbook-form__count--warn' : ''}`}>
                      {message.length}/280
                    </span>
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className={`guestbook-form__btn ${justSent ? 'guestbook-form__btn--sent' : ''}`}
                    >
                      {sending ? (
                        <span className="guestbook-form__spinner" />
                      ) : justSent ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <>
                          Send
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="guestbook-form__btn-icon">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>

        <section>
          <SectionDivider label="Wall of messages" />
          <div className="guestbook-entries">
            {loading ? (
              <div className="guestbook-skeleton" aria-busy="true" aria-label="Loading messages">
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
                <div className="guestbook-skeleton__item">
                  <div className="guestbook-skeleton__avatar" />
                  <div className="guestbook-skeleton__content">
                    <div className="guestbook-skeleton__line" />
                    <div className="guestbook-skeleton__line guestbook-skeleton__line--short" />
                    <div className="guestbook-skeleton__line guestbook-skeleton__line--meta" />
                  </div>
                </div>
              </div>
            ) : (
              entries.map((entry, i) => (
                <a
                  key={entry.id}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="guestbook-entry"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <div className={`guestbook-entry__avatar ${avatarClassFromName(entry.author)}`}>
                    {getInitials(entry.author)}
                  </div>
                  <div className="guestbook-entry__body">
                    <p className="guestbook-entry__message">{entry.message}</p>
                    <div className="guestbook-entry__meta">
                      <span className="guestbook-entry__author">{entry.author}</span>
                      <span className="guestbook-entry__dot">·</span>
                      <span className="guestbook-entry__date">{formatDate(entry.date)}</span>
                    </div>
                    <div className="guestbook-entry__reactions">
                      {ALLOWED_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={`guestbook-entry__reaction ${activeReaction === `${entry.id}-${emoji}` ? 'guestbook-entry__reaction--active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleReact(entry.id, emoji)
                          }}
                          aria-label={`React with ${emoji}`}
                        >
                          <span className="guestbook-entry__reaction-emoji">{emoji}</span>
                          {entry.reactions[emoji] > 0 && (
                            <span className="guestbook-entry__reaction-count">{entry.reactions[emoji]}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  )
}
