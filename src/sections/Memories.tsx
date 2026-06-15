import { useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { PhotoCard } from '../components/PhotoCard'
import { SectionDivider } from '../components/SectionDivider'
import { photos } from '../data/photos'

export function Memories() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const displayed = photos.slice(0, 5)

  const handlePrev = () => {
    if (activeIndex === null) return
    setActiveIndex(activeIndex === 0 ? displayed.length - 1 : activeIndex - 1)
  }

  const handleNext = () => {
    if (activeIndex === null) return
    setActiveIndex(activeIndex === displayed.length - 1 ? 0 : activeIndex + 1)
  }

  return (
    <section id="memories" className="mb-14">
      <SectionDivider label="Photo desk" />
      <p className="text-center text-sm text-subtle mb-5 font-hand">little moments from the build</p>

      <div className="photo-desk">
        {displayed.map((photo, index) => (
          <PhotoCard
            key={index}
            {...photo}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          src={displayed[activeIndex].src}
          caption={displayed[activeIndex].caption}
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
