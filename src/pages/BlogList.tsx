import { Link } from 'react-router-dom'
import { InlineLink } from '../components/InlineLink'
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

      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-12">
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
          <div className="space-y-6">
            {allPosts.map((post) => (
              <article key={post.slug} className="blog-item group">
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                    <h2 className="text-lg font-semibold text-text tracking-tight group-hover:text-accent transition-colors duration-300">
                      {post.title}
                    </h2>
                    <time className="text-sm text-subtle font-mono shrink-0">{formatDate(post.date)}</time>
                  </div>
                  <p className="text-[15px] leading-relaxed text-text/75">{post.summary}</p>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <footer className="text-sm text-subtle text-center">
          <p>
            Built with React & Tailwind. Typeset in Inter, JetBrains Mono, and Caveat.{' '}
            <InlineLink href="#">View source</InlineLink>.
          </p>
        </footer>
      </main>
    </div>
  )
}
/* 9ae1975e */
