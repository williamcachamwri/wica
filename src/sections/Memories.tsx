import { PhotoCard } from '../components/PhotoCard'
import { SectionDivider } from '../components/SectionDivider'
import { photos } from '../data/photos'

export function Memories() {
  return (
    <section id="memories" className="mb-14">
      <SectionDivider label="Photo desk" />
      <p className="text-center text-sm text-subtle mb-5 font-hand">little moments from the build</p>

      <div className="photo-desk">
        {photos.slice(0, 5).map((photo, index) => (
          <PhotoCard key={index} {...photo} />
        ))}
      </div>
    </section>
  )
}
/* 66155a3f */
