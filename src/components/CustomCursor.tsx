import { useEffect, useRef, useState } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
}

let rippleId = 0

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const ringPosRef = useRef({ x: -100, y: -100 })
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rafRef = useRef<number>()

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      setHidden(false)
    }

    const handleLeave = () => setHidden(true)
    const handleEnter = () => setHidden(false)

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]') !== null
      setHovering(isInteractive)
    }

    const handleDown = () => {
      setClicking(true)
      const id = ++rippleId
      setRipples((prev) => [...prev, { id, x: posRef.current.x, y: posRef.current.y }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 500)
    }

    const handleUp = () => setClicking(false)

    const animate = () => {
      const dot = dotRef.current
      const ring = ringRef.current
      if (!dot || !ring) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      // Dot follows instantly
      dot.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`

      // Ring follows with easing
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.18
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.18
      ring.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px)`

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mouseenter', handleEnter)
    window.addEventListener('mouseover', handleOver, { passive: true })
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mouseenter', handleEnter)
      window.removeEventListener('mouseover', handleOver)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  const cursorState = `${hovering ? 'custom-cursor--hover' : ''} ${clicking ? 'custom-cursor--click' : ''} ${hidden ? 'custom-cursor--hidden' : ''}`

  return (
    <>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          aria-hidden="true"
          className="custom-cursor custom-cursor--ripple"
          style={{ transform: `translate(${ripple.x}px, ${ripple.y}px)` }}
        />
      ))}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`custom-cursor custom-cursor--dot ${cursorState}`}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`custom-cursor custom-cursor--ring ${cursorState}`}
      />
    </>
  )
}
/* e8852b63 */
