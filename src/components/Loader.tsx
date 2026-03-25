import { useEffect, useState } from 'react'

interface LoaderProps {
  onDone: () => void
}

export function Loader({ onDone }: LoaderProps) {
  const [phase, setPhase] = useState<'pulse' | 'split'>('pulse')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('split'), 550)
    const t2 = setTimeout(() => onDone(), 1150)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div className={`loader ${phase}`} aria-hidden="true">
      <div className="loader-half loader-half--left" />
      <div className="loader-half loader-half--right" />
      <div className="loader-line" />
    </div>
  )
}
/* 713f3c22 */
