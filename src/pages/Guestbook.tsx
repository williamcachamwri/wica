import { useEffect, useState, useRef, useCallback } from 'react'
import { SEO } from '../components/SEO'
import { ToastContainer, showToast } from '../components/Toast'

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
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SITE_KEY = '0x4AAAAAADkpDYfY0xHNwred'

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [justSent, setJustSent] = useState(false)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  const renderTurnstile = useCallback(() => {
    if (!turnstileRef.current || !window.turnstile) return
    widgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: SITE_KEY,
      theme: 'dark',
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
        body: JSON.stringify({ message: text, turnstileToken }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send')
      }
      setMessage('')
      setJustSent(true)
      window.turnstile.reset(widgetId.current)
      setTimeout(() => setJustSent(false), 2000)
      const entry = await res.json()
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
      <ToastContainer />

      <main id="main" className="max-w-[620px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-10">
          <h1 className="name-title text-[clamp(1.75rem,6vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1]">
            Guestbook
          </h1>
          <p className="mt-2 text-muted text-lg">Leave a trace — a thought, a joke, a hello.</p>
        </section>

        <section className="mb-14">
          <form onSubmit={handleSubmit} className={`guestbook-form ${justSent ? 'guestbook-form--sent' : ''}`}>
            <label className="guestbook-form__label" htmlFor="msg">
              Leave a message
            </label>
            <div className="guestbook-form__row">
              <textarea
                id="msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something…"
                maxLength={280}
                rows={2}
                disabled={sending}
                className="guestbook-form__input"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="guestbook-form__btn"
              >
                {sending ? (
                  <span className="guestbook-form__spinner" />
                ) : justSent ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            <div className="guestbook-form__footer">
              <div ref={turnstileRef} className="guestbook-form__captcha" />
              <span className={`guestbook-form__count ${message.length >= 260 ? 'guestbook-form__count--warn' : ''}`}>
                {message.length}/280
              </span>
            </div>
          </form>
        </section>

        <section className="guestbook-entries">
          {loading ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-muted text-sm">No messages yet. Be the first.</p>
          ) : (
            entries.map((entry, i) => (
              <a
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="guestbook-entry"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <p className="guestbook-entry__message">{entry.message}</p>
                <div className="guestbook-entry__meta">
                  <span className="guestbook-entry__author">— {entry.author}</span>
                  <span className="guestbook-entry__date">{formatDate(entry.date)}</span>
                </div>
              </a>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
