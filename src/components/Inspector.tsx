import { useEffect, useRef, useState, useCallback } from 'react'

interface ElementInfo {
  tag: string
  id: string
  classes: string
  width: number
  height: number
}

interface InspectorProps {
  active: boolean
}

export function Inspector({ active }: InspectorProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [hoveredEl, setHoveredEl] = useState<Element | null>(null)
  const [hoveredInfo, setHoveredInfo] = useState<ElementInfo | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const getElementInfo = useCallback((el: Element): ElementInfo => {
    const rect = el.getBoundingClientRect()
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id ? `#${el.id}` : '',
      classes: Array.from(el.classList)
        .filter((c) => !c.startsWith('inspector'))
        .map((c) => `.${c}`)
        .join(' '),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }
  }, [])

  const inspectAtPoint = useCallback((x: number, y: number) => {
    const overlay = overlayRef.current
    if (!overlay) return null

    // Temporarily disable overlay pointer events so elementFromPoint sees through it
    overlay.style.pointerEvents = 'none'
    const target = document.elementFromPoint(x, y)
    overlay.style.pointerEvents = 'auto'

    if (!target) return null

    let current: Element | null = target
    while (current && (current.classList.contains('inspector-overlay') || current.closest('.inspector-overlay'))) {
      current = current.parentElement
    }

    if (!current || current === document.body || current === document.documentElement) return null
    return current
  }, [])

  useEffect(() => {
    if (!active) {
      setHoveredEl(null)
      setHoveredInfo(null)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      const el = inspectAtPoint(e.clientX, e.clientY)
      if (el) {
        setHoveredEl(el)
        setHoveredInfo(getElementInfo(el))
      } else {
        setHoveredEl(null)
        setHoveredInfo(null)
      }
    }

    const handleScroll = () => {
      if (hoveredEl) {
        setHoveredInfo(getElementInfo(hoveredEl))
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (hoveredInfo) {
        console.log('[Inspector]', hoveredInfo.tag, hoveredInfo.id, hoveredInfo.classes, `${hoveredInfo.width}x${hoveredInfo.height}`)
      }
    }

    const overlay = overlayRef.current
    if (!overlay) return

    overlay.addEventListener('mousemove', handleMouseMove)
    overlay.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      overlay.removeEventListener('mousemove', handleMouseMove)
      overlay.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [active, hoveredEl, hoveredInfo, getElementInfo, inspectAtPoint])

  const rect = hoveredEl?.getBoundingClientRect()

  if (!active) return null

  return (
    <div ref={overlayRef} className="inspector-overlay">
      {rect && hoveredInfo && (
        <>
          <div
            className="inspector-highlight"
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            }}
          />
          <div
            className="inspector-tooltip"
            style={{
              left: Math.min(mousePos.x + 16, window.innerWidth - 260),
              top: mousePos.y + 16,
            }}
          >
            <div className="inspector-tooltip__header">
              <span className="inspector-tooltip__tag">{hoveredInfo.tag}</span>
              <span className="inspector-tooltip__size">{hoveredInfo.width} × {hoveredInfo.height}</span>
            </div>
            {hoveredInfo.id && <div className="inspector-tooltip__id">{hoveredInfo.id}</div>}
            {hoveredInfo.classes && <div className="inspector-tooltip__classes">{hoveredInfo.classes}</div>}
          </div>
        </>
      )}

      <div className="inspector-hint">
        Press <kbd>Esc</kbd> to clear · Click to log
      </div>
    </div>
  )
}
