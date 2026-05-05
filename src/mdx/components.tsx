import { useState } from 'react'
export { Math } from './Math'

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 p-4 bg-code border-l-4 border-accent rounded-r-lg">
      {children}
    </div>
  )
}

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button
      type="button"
      onClick={() => setCount((c) => c + 1)}
      className="my-4 px-4 py-2 bg-text text-bg font-mono text-sm rounded hover:bg-accent transition-colors"
    >
      Clicked {count} time{count === 1 ? '' : 's'}
    </button>
  )
}

export function PixelBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 p-6 border-2 border-text shadow-[4px_4px_0_0_var(--text-primary)]">
      {children}
    </div>
  )
}
/* 5333a2ac */
