import type { Photo } from '../types'

type PhotoCardProps = Photo & { index?: number; onClick?: () => void }

export function PhotoCard({ src, caption, rotate, index = 0, onClick }: PhotoCardProps) {
  return (
    <figure
      className="polaroid"
      style={{ '--rotate': `${rotate}deg`, '--i': index } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open ${caption}` : undefined}
    >
      <img src={src} alt={caption} loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
