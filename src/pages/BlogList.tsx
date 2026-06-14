import { Link } from 'react-router-dom'
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
  return (
    <div className="app-shell app-shell--in">
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

        <section className="mb-14">
          <SectionDivider label="All posts" />
          <div className="blog-list">
            {allPosts.map((post) => (
              <article key={post.slug} className="blog-item group">
                <Link to={`/blog/${post.slug}`} className="blog-item__link">
                  <div className="blog-item__header">
                    <h2 className="blog-item__title">
                      {post.title}
                    </h2>
                    <time className="blog-item__date" dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                  </div>
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
            ))}
          </div>
        </section>

        <footer className="text-sm text-subtle text-center">
          <p>built with patience &middot; styled with restraint</p>
        </footer>
      </main>
    </div>
  )
}
