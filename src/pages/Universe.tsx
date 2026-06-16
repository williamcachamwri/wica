import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'
import { PixelGardenCanvas } from '../features/garden/components/pixel-garden-canvas'
import { GARDEN_OBJECTS } from '../features/garden/utils/garden-world-config'

export default function Universe() {
  return (
    <div className="app-shell app-shell--in">
      <SEO
        title="Universe"
        description="An interactive pixel black hole. Light bends, comets drift, and a lone astronaut watches from afar."
        pathname="/universe"
      />
      <div className="grain" aria-hidden="true" />

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-8">
          <Link to="/" className="inline-link text-sm mb-6 inline-block">
            ‹ back home
          </Link>
          <h1 className="name-title text-[clamp(2rem,6vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1]">
            Universe
          </h1>
          <p className="mt-3 text-[17px] leading-[1.7] text-text-secondary">
            A tiny pixel black hole at the center of the universe. Light bends around its shadow, comets drift past, and a lone astronaut watches from afar.
          </p>
        </section>

        <section className="mb-14 -mx-6 md:-mx-12 lg:-mx-24">
          <div className="garden-wrapper">
            <PixelGardenCanvas objects={GARDEN_OBJECTS} />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
