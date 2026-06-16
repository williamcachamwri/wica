import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

const PURIFY_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['style'],
  ADD_ATTR: ['style'],
}

interface MermaidProps {
  children: string
}

let mermaidPromise: Promise<typeof import('mermaid')> | null = null
let initialized = false

function loadMermaid() {
  if (!mermaidPromise) mermaidPromise = import('mermaid')
  return mermaidPromise
}

function getVar(name: string): string {
  if (typeof window === 'undefined') return '#000000'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000000'
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  if (clean.length === 3) return { r: parseInt(clean[0] + clean[0], 16), g: parseInt(clean[1] + clean[1], 16), b: parseInt(clean[2] + clean[2], 16) }
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

function mix(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1); const c2 = hexToRgb(color2)
  return rgbToHex(c1.r * (1 - ratio) + c2.r * ratio, c1.g * (1 - ratio) + c2.g * ratio, c1.b * (1 - ratio) + c2.b * ratio)
}

async function initMermaid() {
  const mermaid = await loadMermaid()
  if (initialized) return mermaid

  const accent = getVar('--accent'); const surface = getVar('--surface'); const bg = getVar('--bg')
  const text = getVar('--text'); const textMuted = getVar('--text-muted'); const border = getVar('--border')

  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: mix(accent, surface, 0.12), primaryTextColor: text, primaryBorderColor: accent,
      lineColor: textMuted, secondaryColor: surface, tertiaryColor: bg,
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', nodeBorder: '1px',
      clusterBkg: mix(accent, surface, 0.04), clusterBorder: border,
      actorBorder: border, actorBkg: surface, actorLineColor: textMuted, signalColor: text,
      sectionBkgColor: surface, altSectionBkgColor: bg, gridColor: border,
      pieOuterStrokeWidth: '1px', pieOuterStroke: border, pieTitleTextSize: '16px',
      pieTitleTextColor: text, pieSectionTextSize: '12px', pieSectionTextColor: text,
    },
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis', padding: 16 },
    sequence: { useMaxWidth: true, diagramMarginX: 20, diagramMarginY: 20 },
    gantt: { useMaxWidth: true, leftPadding: 60, gridLineStartPadding: 20, fontSize: 14, numberSectionStyles: 4, axisFormat: '%Y-%m-%d' },
  })
  initialized = true
  return mermaid
}

export function Mermaid({ children }: MermaidProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const mermaidModule = await initMermaid()
        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
        const text = typeof children === 'string' ? children.trim() : String(children).trim()
        const { svg: renderedSvg } = await mermaidModule.default.render(id, text)
        if (cancelled) return
        setSvg(DOMPurify.sanitize(renderedSvg, PURIFY_CONFIG))
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
    return <div className="mermaid-error"><p>Failed to render diagram</p><pre>{error}</pre></div>
  }

  return <div className="mermaid-diagram" data-loading={loading} dangerouslySetInnerHTML={{ __html: svg }} />
}
