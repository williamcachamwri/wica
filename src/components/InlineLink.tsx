import type { ReactNode } from 'react'

interface InlineLinkProps {
  href: string
  children: ReactNode
}

export function InlineLink({ href, children }: InlineLinkProps) {
  return (
    <a href={href} className="inline-link">
      {children}
    </a>
  )
}
/* e8a97383 */
