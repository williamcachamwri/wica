import type { Photo } from '../types'

type PhotoCardProps = Photo

export function PhotoCard({ src, caption, rotate }: PhotoCardProps) {
  return (
    <figure className="polaroid" style={{ '--rotate': `${rotate}deg` } as React.CSSProperties}>
      <img src={src} alt={caption} loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
/* 40ac1e4a */
