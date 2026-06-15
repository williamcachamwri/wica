import { SEO } from '../components/SEO'
import { SectionDivider } from '../components/SectionDivider'
import { Footer } from '../sections/Footer'

interface UsesItem {
  name: string
  description?: string
  href?: string
}

interface UsesCategory {
  label: string
  items: UsesItem[]
}

const CATEGORIES: UsesCategory[] = [
  {
    label: 'Hardware',
    items: [
      { name: 'MacBook Air M2', description: '13-inch, daily driver' },
      { name: 'Keychron K3', description: 'Low-profile mechanical keyboard' },
      { name: 'Logitech MX Master 3S', description: 'Wireless mouse' },
      { name: 'Dell U2723QE', description: '27-inch 4K monitor' },
    ],
  },
  {
    label: 'Software',
    items: [
      { name: 'VS Code', description: 'Editor of choice', href: 'https://code.visualstudio.com' },
      { name: 'iTerm2', description: 'Terminal', href: 'https://iterm2.com' },
      { name: 'Figma', description: 'Design & prototypes', href: 'https://figma.com' },
      { name: 'Notion', description: 'Notes & planning', href: 'https://notion.so' },
      { name: 'Spotify', description: 'Background noise', href: 'https://spotify.com' },
    ],
  },
  {
    label: 'Desk',
    items: [
      { name: 'IKEA BEKANT', description: 'Standing desk frame' },
      { name: 'Herman Miller Sayl', description: 'Office chair' },
      { name: 'Warm desk lamp', description: 'For late-night sessions' },
      { name: 'Plants', description: 'A few survivors' },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { name: 'GitHub', description: 'Code & project hosting', href: 'https://github.com' },
      { name: 'Cloudflare Pages', description: 'Hosting', href: 'https://pages.cloudflare.com' },
      { name: 'Vite', description: 'Build tool', href: 'https://vitejs.dev' },
      { name: 'Obsidian', description: 'Knowledge base', href: 'https://obsidian.md' },
    ],
  },
]

export default function Uses() {
  return (
    <>
      <SEO pathname="/uses" title="Uses" description="Tools, gear, and software I use every day." />
      <div className="app-shell app-shell--in">
        <div className="grain" aria-hidden="true" />
        <main id="main" className="max-w-[680px] mx-auto px-6 pt-24 md:pt-32 pb-20">
          <section className="mb-14">
            <div className="mb-8">
              <h1 className="name-title name-title--hero text-[clamp(2rem,7vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.08] mb-3">
                Uses
              </h1>
              <p className="text-[17px] leading-[1.7] text-text-secondary max-w-[560px]">
                A living list of the hardware, software, and small rituals that keep me productive — or at least entertained.
              </p>
            </div>

            <div className="space-y-10">
              {CATEGORIES.map((category) => (
                <div key={category.label}>
                  <SectionDivider label={category.label} />
                  <ul className="space-y-2 mt-4">
                    {category.items.map((item) => (
                      <li
                        key={item.name}
                        className="group flex items-start justify-between gap-4 py-2 border-b border-[var(--border)] last:border-b-0"
                      >
                        <div>
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-link font-medium"
                            >
                              {item.name}
                            </a>
                          ) : (
                            <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                          )}
                          {item.description && (
                            <p className="text-sm text-[var(--text-muted)] mt-0.5">{item.description}</p>
                          )}
                        </div>
                        {item.href && (
                          <span className="text-xs text-[var(--text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
                            ↗
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  )
}
