import { Loader } from '../components/Loader'
import { SEO } from '../components/SEO'
import { Footer } from '../sections/Footer'
import { Hero } from '../sections/Hero'
import { Memories } from '../sections/Memories'
import { Projects } from '../sections/Projects'
import { useEffect, useState } from 'react'

const LOADER_SHOWN_KEY = 'ddt-loader-shown'

export default function Home() {
  const alreadyShown = sessionStorage.getItem(LOADER_SHOWN_KEY) === 'true'
  const [loading, setLoading] = useState(!alreadyShown)
  const [loaded, setLoaded] = useState(alreadyShown)

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(LOADER_SHOWN_KEY, 'true')
      const t = setTimeout(() => setLoaded(true), 50)
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <>
      <SEO pathname="/" />
      {loading && <Loader onDone={() => setLoading(false)} />}

      <div className={`app-shell ${loaded ? 'app-shell--in' : 'app-shell--out'}`}>
        <div className="grain" aria-hidden="true" />

        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
          <Hero typewriterStart={!loading} />
          <Projects />
          <Memories />
          <Footer />
        </main>
      </div>
    </>
  )
}
