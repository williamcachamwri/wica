import { SEO } from '../components/SEO'
import { SectionDivider } from '../components/SectionDivider'
import { Footer } from '../sections/Footer'
import { USES_ICONS } from '../data/usesIcons'

interface UsesItem {
  name: string
  description?: string
  href?: string
  icon?: keyof typeof USES_ICONS
  badge?: string
}

interface UsesCategory {
  label: string
  items: UsesItem[]
}

const CATEGORIES: UsesCategory[] = [
  {
    label: 'Hardware',
    items: [
      { name: 'MacBook Air M2', description: '13-inch, daily driver', icon: 'laptop', badge: 'daily driver' },
      { name: 'Keychron K3', description: 'Low-profile mechanical keyboard', icon: 'keyboard' },
      { name: 'Logitech MX Master 3S', description: 'Wireless mouse', icon: 'mouse' },
      { name: 'Dell U2723QE', description: '27-inch 4K monitor', icon: 'monitor' },
    ],
  },
  {
    label: 'Software',
    items: [
      { name: 'VS Code', description: 'Editor of choice', href: 'https://code.visualstudio.com', icon: 'editor', badge: 'favorite' },
      { name: 'iTerm2', description: 'Terminal', href: 'https://iterm2.com', icon: 'terminal' },
      { name: 'Figma', description: 'Design & prototypes', href: 'https://figma.com', icon: 'design' },
      { name: 'Notion', description: 'Notes & planning', href: 'https://notion.so', icon: 'notes' },
      { name: 'Spotify', description: 'Background noise', href: 'https://spotify.com', icon: 'music' },
    ],
  },
  {
    label: 'Desk',
    items: [
      { name: 'IKEA BEKANT', description: 'Standing desk frame', icon: 'desk' },
      { name: 'Herman Miller Sayl', description: 'Office chair', icon: 'desk', badge: 'comfort' },
      { name: 'Warm desk lamp', description: 'For late-night sessions', icon: 'lamp' },
      { name: 'Plants', description: 'A few survivors', icon: 'plant' },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { name: 'GitHub', description: 'Code & project hosting', href: 'https://github.com', icon: 'github' },
      { name: 'Cloudflare Pages', description: 'Hosting', href: 'https://pages.cloudflare.com', icon: 'cloud' },
      { name: 'Vite', description: 'Build tool', href: 'https://vitejs.dev', icon: 'buildtool' },
      { name: 'Obsidian', description: 'Knowledge base', href: 'https://obsidian.md', icon: 'knowledge' },
    ],
  },
]

const UPDATED_AT = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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
              <p className="uses-updated">Last updated {UPDATED_AT}</p>
            </div>

            <div className="space-y-10">
              {CATEGORIES.map((category) => (
                <div key={category.label}>
                  <SectionDivider label={category.label} />
                  <div className="uses-grid">
                    {category.items.map((item, i) => {
                      const Icon = item.icon ? USES_ICONS[item.icon] : null
                      const content = (
                        <>
                          <div className="icon-box icon-box--sm">
                            {Icon && <Icon />}
                          </div>
                          <div className="uses-item__content">
                            <div className="uses-item__header">
                              <span className="uses-item__name">{item.name}</span>
                              {item.badge && <span className="uses-badge">{item.badge}</span>}
                            </div>
                            {item.description && (
                              <p className="uses-item__description">{item.description}</p>
                            )}
                          </div>
                          {item.href && <span className="uses-item__arrow">↗</span>}
                        </>
                      )

                      return item.href ? (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="uses-item"
                          style={{ animationDelay: `${i * 0.04}s` }}
                        >
                          {content}
                        </a>
                      ) : (
                        <div
                          key={item.name}
                          className="uses-item"
                          style={{ animationDelay: `${i * 0.04}s` }}
                        >
                          {content}
                        </div>
                      )
                    })}
                  </div>
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
