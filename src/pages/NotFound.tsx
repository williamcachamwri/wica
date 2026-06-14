import { Link, useLocation } from 'react-router-dom'
import { InlineLink } from '../components/InlineLink'
import { SEO } from '../components/SEO'

export default function NotFound() {
  const location = useLocation()

  return (
    <div className="app-shell app-shell--in">
      <SEO
        title="404 — Lost in space"
        description="The page you are looking for does not exist."
      />
      <div className="grain" aria-hidden="true" />

      <main className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
        <div className="mb-10 flex justify-center">
          <svg viewBox="0 0 120 80" className="w-40 h-auto text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="60" cy="40" r="28" strokeDasharray="4 3" opacity="0.3" />
            <circle cx="60" cy="40" r="18" strokeDasharray="3 4" opacity="0.5" />
            <circle cx="60" cy="40" r="8" opacity="0.8" />
            <path d="M60 12V0M60 80V68M108 40H96M24 40H12M96.6 23.4l-8.5 8.5M31.9 48.1l-8.5 8.5M96.6 56.6l-8.5-8.5M31.9 31.9l-8.5-8.5" strokeDasharray="2 3" opacity="0.4" />
          </svg>
        </div>

        <div className="mb-8">
          <span className="inline-block px-3 py-1 text-sm font-mono text-subtle border border-border rounded-full">
            404
          </span>
        </div>

        <h1 className="name-title text-[clamp(2rem,6vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-4">
          This page does not exist
        </h1>

        <p className="text-[17px] leading-[1.7] text-text-secondary mb-2">
          <code className="px-1.5 py-0.5 bg-code rounded text-sm font-mono">{location.pathname}</code> is either gone, never existed, or got sucked into a black hole.
        </p>
        <p className="text-[15px] text-muted mb-10">
          Maybe try your luck with a different route?
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="inline-link">
            ‹ back home
          </Link>
          <Link to="/blog" className="inline-link">
            blog ›
          </Link>
          <InlineLink href="https://github.com/williamcachamwri">williamcachamwri</InlineLink>
        </div>
      </main>
    </div>
  )
}
