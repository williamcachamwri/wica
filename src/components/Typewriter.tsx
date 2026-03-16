import { useEffect, useState } from 'react'

interface TypewriterProps {
  text: string
  delay?: number
  start?: boolean
}

export function Typewriter({ text, delay = 70, start = true }: TypewriterProps) {
  const [display, setDisplay] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!start) return
    let i = 0
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i + 1))
      i += 1
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, delay)
    return () => clearInterval(interval)
  }, [text, delay, start])

  return (
    <span className="font-mono text-[13px] text-muted tracking-tight">
      {display}
      <span
        className={`inline-block w-[7px] h-[15px] ml-[3px] align-[-1px] bg-muted ${done ? 'animate-blink' : ''}`}
        aria-hidden="true"
      />
    </span>
  )
}
