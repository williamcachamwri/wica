import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function getStatus(h: number): { label: string; color: string } {
  if (h >= 6 && h < 9) return { label: 'Morning 🌅', color: '#f59e0b' }
  if (h >= 9 && h < 12) return { label: 'Working ⚡', color: '#22c55e' }
  if (h >= 12 && h < 14) return { label: 'Lunch 🍜', color: '#f97316' }
  if (h >= 14 && h < 18) return { label: 'Working ⚡', color: '#22c55e' }
  if (h >= 18 && h < 22) return { label: 'Evening 🌙', color: '#8b5cf6' }
  return { label: 'Sleeping 💤', color: '#6366f1' }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function DigitRoll({ digit, label }: { digit: number; label: string }) {
  return (
    <div className="wh__digit-wrap" aria-label={`${label}: ${digit}`}>
      <motion.div
        className="wh__digit-strip"
        animate={{ y: `-${digit * 1.35}rem` }}
        transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="wh__digit">{d}</span>
        ))}
      </motion.div>
    </div>
  )
}

export function WorkingHours() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const AUTHOR_TZ = 'Asia/Ho_Chi_Minh'
  const authorTime = new Intl.DateTimeFormat('en-US', {
    timeZone: AUTHOR_TZ,
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false, weekday: 'short', day: 'numeric', month: 'numeric',
  }).formatToParts(now)
  const getPart = (type: string) => authorTime.find(p => p.type === type)?.value ?? '0'
  const h = parseInt(getPart('hour'))
  const m = parseInt(getPart('minute'))
  const s = parseInt(getPart('second'))
  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(getPart('weekday'))
  const day = parseInt(getPart('day'))
  const month = parseInt(getPart('month'))
  const status = getStatus(h)
  const hh = pad(h)
  const mm = pad(m)
  const ss = pad(s)

  return (
    <div className="wh">
      <div className="wh__row">
        <div className="wh__digits">
          <DigitRoll digit={Number(hh[0])} label="tens of hours" />
          <DigitRoll digit={Number(hh[1])} label="hours" />
          <span className="wh__colon">:</span>
          <DigitRoll digit={Number(mm[0])} label="tens of minutes" />
          <DigitRoll digit={Number(mm[1])} label="minutes" />
          <span className="wh__colon">:</span>
          <DigitRoll digit={Number(ss[0])} label="tens of seconds" />
          <DigitRoll digit={Number(ss[1])} label="seconds" />
        </div>

        <span className="wh__dot" style={{ background: status.color }} />
        <span className="wh__status" style={{ color: status.color }}>
          {status.label}
        </span>
        <span className="wh__sep" />
        <span className="wh__tz">GMT+7</span>
        <span className="wh__date">{WEEKDAYS[dow]}, {month}/{day}</span>
      </div>
    </div>
  )
}
