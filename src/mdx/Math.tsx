import katex from 'katex'

interface MathProps {
  children: string
  block?: boolean
}

export function Math({ children, block = false }: MathProps) {
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
