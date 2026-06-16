import { useEffect, useRef, useState } from 'react'

interface MermaidProps {
  children: string
}

let mermaidPromise: Promise<typeof import('mermaid')> | null = null
let initialized = false

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
  }
  return mermaidPromise
}

async function initMermaid() {
  const mermaid = await loadMermaid()
  if (initialized) return mermaid
  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: 'color-mix(in srgb, var(--accent) 12%, var(--surface))',
      primaryTextColor: 'var(--text)',
      primaryBorderColor: 'var(--accent)',
      lineColor: 'var(--text-muted)',
      secondaryColor: 'var(--surface)',
      tertiaryColor: 'var(--bg)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      nodeBorder: '1px',
      clusterBkg: 'color-mix(in srgb, var(--accent) 4%, var(--surface))',
      clusterBorder: 'var(--border)',
      actorBorder: 'var(--border)',
      actorBkg: 'var(--surface)',
      actorLineColor: 'var(--text-muted)',
      signalColor: 'var(--text)',
      sectionBkgColor: 'var(--surface)',
      altSectionBkgColor: 'var(--bg)',
      gridColor: 'var(--border)',
      pieOuterStrokeWidth: '1px',
      pieOuterStroke: 'var(--border)',
      pieTitleTextSize: '16px',
      pieTitleTextColor: 'var(--text)',
      pieSectionTextSize: '12px',
      pieSectionTextColor: 'var(--text)',
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
      padding: 16,
    },
    sequence: {
      useMaxWidth: true,
      diagramMarginX: 20,
      diagramMarginY: 20,
    },
    gantt: {
      useMaxWidth: true,
      leftPadding: 60,
      gridLineStartPadding: 20,
      fontSize: 14,
      numberSectionStyles: 4,
      axisFormat: '%Y-%m-%d',
    },
  })
  initialized = true
  return mermaid
}

export function Mermaid({ children }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const mermaid = await initMermaid()
        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
        const text = typeof children === 'string' ? children.trim() : String(children).trim()
        const { svg: renderedSvg } = await mermaid.default.render(id, text, ref.current ?? undefined)
        if (cancelled) return
        setSvg(renderedSvg)
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to render diagram')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    render()
    return () => { cancelled = true }
  }, [children])

  if (error) {
    return (
      <div className="mermaid-error">
        <p>Failed to render diagram</p>
        <pre>{error}</pre>
      </div>
    )
  }

  return (
    <div className="mermaid-diagram" ref={ref} data-loading={loading} dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
