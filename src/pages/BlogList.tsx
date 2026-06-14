import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { SectionDivider } from '../components/SectionDivider'
import { allPosts } from '../data/allPosts'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogList() {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? allPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.summary.toLowerCase().includes(query.toLowerCase()),
      )
    : allPosts

  return (
    <div className="app-shell app-shell--in">
      <SEO
        title="Blog"
        description="Notes on design, code, and slow living."
        pathname="/blog"
      />
      <div className="grain" aria-hidden="true" />

      <main id="main" className="max-w-[720px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-14">
          <Link to="/" className="inline-link text-sm mb-6 inline-block">
            ‹ back home
          </Link>
          <h1 className="name-title text-[clamp(2rem,6vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1]">
            Blog
          </h1>
          <p className="mt-2 text-muted text-lg">Notes on design, code, and slow living.</p>
        </section>

        <div className="blog-search mb-8">
          <svg className="blog-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="blog-search__input"
          />
          {query.trim() && (
            <button className="blog-search__clear" onClick={() => setQuery('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <section className="mb-14">
          <SectionDivider label={query.trim() ? `${filtered.length} post${filtered.length !== 1 ? 's' : ''} found` : 'All posts'} />
          <div className="blog-list">
            {filtered.length === 0 ? (
              <p className="text-muted text-sm">No posts match your search.</p>
            ) : (
              filtered.map((post) => (
                <article key={post.slug} className="blog-item group">
                  <Link to={`/blog/${post.slug}`} className="blog-item__link">
                    <div className="blog-item__header">
                      <h2 className="blog-item__title">
                        {post.title}
                      </h2>
                      <div className="blog-item__meta">
                        <time className="blog-item__date" dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                        {post.readTime && (
                          <span className="blog-item__readtime">{post.readTime} read</span>
                        )}
                      </div>
                    </div>
                    {post.tags && (
                      <div className="blog-item__tags">
                        {post.tags.map((t) => (
                          <span key={t} className="blog-item__tag">{t}</span>
                        ))}
                      </div>
                    )}
                    <p className="blog-item__summary">{post.summary}</p>
                    <span className="blog-item__arrow" aria-hidden="true">
                      read article
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        <footer className="text-sm text-subtle text-center">
          <p>built with patience · styled with restraint</p>
        </footer>
      </main>
    </div>
  )
}
