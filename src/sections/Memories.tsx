import { useEffect, useRef, useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { PhotoCard } from '../components/PhotoCard'
import { SectionDivider } from '../components/SectionDivider'
import { photos } from '../data/photos'

export function Memories() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const displayed = photos.slice(0, 5)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handlePrev = () => {
    if (activeIndex === null) return
    setActiveIndex(activeIndex === 0 ? displayed.length - 1 : activeIndex - 1)
  }

  const handleNext = () => {
    if (activeIndex === null) return
    setActiveIndex(activeIndex === displayed.length - 1 ? 0 : activeIndex + 1)
  }

  return (
    <section id="memories" className={`mb-14 ${visible ? 'memories--visible' : ''}`} ref={sectionRef}>
      <SectionDivider label="Photo desk" />
      <p className="memories__subtitle">little moments from the build</p>

      <div className="photo-desk">
        {displayed.map((photo, index) => (
          <PhotoCard
            key={index}
            {...photo}
            index={index}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          src={displayed[activeIndex].src}
          caption={displayed[activeIndex].caption}
          index={activeIndex}
          total={displayed.length}
          allPhotos={displayed}
          onClose={() => setActiveIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={displayed.length > 1}
          hasNext={displayed.length > 1}
        />
      )}
    </section>
  )
}
