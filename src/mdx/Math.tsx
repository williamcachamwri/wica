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

export function Math({ children, block = false }: MathProps) {
  useEffect(() => {
    loadKatexCss()
  }, [])

  const expression = typeof children === 'string' ? children.trim() : String(children).trim()
  const html = katex.renderToString(expression, {
    throwOnError: false,
    displayMode: block,
  })

  if (block) {
    return (
      <div
        className="math-block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <span
      className="math-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
