import { useEffect, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Photo {
  src: string
  caption: string
}

interface LightboxProps {
  src: string
  caption: string
  index?: number
  total?: number
  allPhotos?: Photo[]
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M10 4 L4 8 L10 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M6 4 L12 8 L6 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="6" y="1" width="4" height="14" transform="rotate(45 8 8)" fill="currentColor" />
      <rect x="6" y="1" width="4" height="14" transform="rotate(-45 8 8)" fill="currentColor" />
    </svg>
  )
}

export function Lightbox({
  src,
  caption,
  index = 0,
  total = 1,
  allPhotos,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LightboxProps) {
  const [transitionDir, setTransitionDir] = useState<'left' | 'right' | null>(null)
  const [keysVisible, setKeysVisible] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const keysTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    keysTimer.current = setTimeout(() => setKeysVisible(false), 2000)
    return () => {
      if (keysTimer.current) clearTimeout(keysTimer.current)
    }
  }, [])

  const triggerPrev = useCallback(() => {
    setTransitionDir('right')
    onPrev?.()
  }, [onPrev])

  const triggerNext = useCallback(() => {
    setTransitionDir('left')
    onNext?.()
  }, [onNext])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && onPrev) triggerPrev()
    if (e.key === 'ArrowRight' && onNext) triggerNext()
  }, [onClose, onPrev, onNext, triggerPrev, triggerNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50 && onPrev) triggerPrev()
    if (delta < -50 && onNext) triggerNext()
    touchStartX.current = null
  }

  const handleAnimationEnd = () => setTransitionDir(null)

  const photos = allPhotos ?? [{ src, caption }]
  const slideClass = transitionDir ? `lightbox__image--slide-${transitionDir}` : ''

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="lightbox__backdrop" aria-hidden="true" onClick={onClose} />

      <div className="lightbox__strip">
        <div className="lightbox__thumbs">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`lightbox__thumb ${i === index ? 'lightbox__thumb--active' : ''}`}
              aria-hidden="true"
            >
              <img src={photo.src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
        <span className="lightbox__counter">
          {index + 1} / {total}
        </span>
      </div>

      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close preview"
      >
        <CloseIcon />
      </button>

      {hasPrev && onPrev && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={(e) => { e.stopPropagation(); triggerPrev() }}
          aria-label="Previous image"
        >
          <PrevIcon />
        </button>
      )}

      {hasNext && onNext && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={(e) => { e.stopPropagation(); triggerNext() }}
          aria-label="Next image"
        >
          <NextIcon />
        </button>
      )}

      <figure
        className="lightbox__content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={src}
          src={src}
          alt={caption}
          className={`lightbox__image ${slideClass}`}
          onAnimationEnd={handleAnimationEnd}
        />
        <figcaption className="lightbox__caption">{caption}</figcaption>
      </figure>

      <div className={`lightbox__keys ${keysVisible ? 'lightbox__keys--visible' : ''}`}>
        ← → navigate · Esc close
      </div>
    </div>,
    document.body
  )
}
