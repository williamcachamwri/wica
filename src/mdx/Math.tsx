import { useEffect } from 'react'
import katex from 'katex'

interface MathProps {
  children: string
  block?: boolean
}

function loadKatexCss() {
  const href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

function renderSafe(expression: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expression, { throwOnError: true, displayMode })
  } catch {
    return `<code class="math-error">${expression}</code>`
  }
}

export function Math({ children, block = false }: MathProps) {
  useEffect(() => { loadKatexCss() }, [])

  const expression = typeof children === 'string' ? children.trim() : String(children).trim()
  const html = renderSafe(expression, block)

  if (block) {
    return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />
  }
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
}
