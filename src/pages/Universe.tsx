import { Link } from 'react-router-dom'
import { InlineLink } from '../components/InlineLink'
import { PixelGardenCanvas } from '../features/garden/components/pixel-garden-canvas'
import { GARDEN_OBJECTS } from '../features/garden/utils/garden-world-config'

export default function Universe() {
  return (
    <div className="app-shell app-shell--in">
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

        <footer className="footer">
          <div className="footer__top">
            <div className="footer__brand">
              <span className="footer__name">Lê Vĩnh Khang</span>
              <span className="footer__role">Developer & maker</span>
            </div>
            <nav className="footer__links">
              <Link to="/" className="footer__link">home</Link>
              <Link to="/blog" className="footer__link">blog</Link>
              <InlineLink href="https://github.com/williamcachamwri">github</InlineLink>
              <InlineLink href="mailto:williamcachamwri@gmail.com">email</InlineLink>
            </nav>
          </div>
          <div className="footer__bottom">
            <p>
              Built with React & Tailwind. Typeset in Inter, JetBrains Mono, and Caveat.{' '}
              <InlineLink href="#">View source</InlineLink>.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
