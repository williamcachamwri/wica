import { useEffect, useState } from 'react'

interface CyclingTypewriterProps {
  phrases: string[]
  typeDelay?: number
  deleteDelay?: number
  pauseDelay?: number
  start?: boolean
}

type Phase = 'typing' | 'pausing' | 'deleting'

export function CyclingTypewriter({
  phrases,
  typeDelay = 70,
  deleteDelay = 35,
  pauseDelay = 1600,
  start = true,
}: CyclingTypewriterProps) {
  const [display, setDisplay] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')

  useEffect(() => {
    if (!start) return

    const currentPhrase = phrases[phraseIndex]
    let timer: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (display.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplay(currentPhrase.slice(0, display.length + 1))
        }, typeDelay)
      } else {
        timer = setTimeout(() => setPhase('pausing'), pauseDelay)
      }
    } else if (phase === 'pausing') {
      timer = setTimeout(() => setPhase('deleting'), 200)
    } else if (phase === 'deleting') {
      if (display.length > 0) {
        timer = setTimeout(() => {
          setDisplay(display.slice(0, -1))
        }, deleteDelay)
      } else {
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timer)
  }, [display, phase, phraseIndex, phrases, start, typeDelay, deleteDelay, pauseDelay])

  const showCursor = phase !== 'pausing' || display.length === phrases[phraseIndex]?.length

  return (
    <span className="font-mono text-[13px] text-muted tracking-tight">
      {display}
      <span
        className={`inline-block w-[7px] h-[15px] ml-[3px] align-[-1px] bg-muted ${showCursor ? 'animate-blink' : ''}`}
        aria-hidden="true"
      />
    </span>
  )
}
/* d0a40192 */
