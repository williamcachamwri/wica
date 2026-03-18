import { Link, useLocation } from 'react-router-dom'
import { InlineLink } from '../components/InlineLink'

export default function NotFound() {
  const location = useLocation()

  return (
    <div className="app-shell app-shell--in">
      <div className="grain" aria-hidden="true" />

      <main className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 text-sm font-mono text-subtle border border-border rounded-full">
            404
          </span>
        </div>

        <h1 className="name-title text-[clamp(2rem,6vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-4">
          Lost in space
        </h1>

        <p className="text-[17px] leading-[1.7] text-text-secondary mb-2">
          The page <code className="px-1.5 py-0.5 bg-code rounded text-sm font-mono">{location.pathname}</code> does not exist.
        </p>
        <p className="text-[15px] text-muted mb-10">
          It may have moved, never existed, or was pulled into a black hole.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="inline-link">
            ‹ back home
          </Link>
          <InlineLink href="https://github.com/williamcachamwri">williamcachamwri</InlineLink>
        </div>
      </main>
    </div>
  )
}
