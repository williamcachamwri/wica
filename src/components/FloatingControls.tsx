import { motion } from 'framer-motion'

const ACCENT_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Violet', value: '#7c3aed' },
]

interface FloatingControlsProps {
  active: boolean
  onToggle: () => void
  accent: string
  onAccentChange: (color: string) => void
}

export function FloatingControls({ active, onToggle, accent, onAccentChange }: FloatingControlsProps) {
  return (
    <motion.div
      className={`floating-controls${active ? ' floating-controls--active' : ''}`}
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
    >
      <button
        type="button"
        className={`floating-controls__row${active ? ' floating-controls__row--active' : ''}`}
        onClick={onToggle}
        title={active ? 'Disable inspector' : 'Enable inspector'}
      >
        <motion.span
          className="floating-controls__icon"
          animate={{ rotate: active ? 180 : 0, color: active ? 'var(--accent)' : undefined }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          ◈
        </motion.span>
        <span className="floating-controls__label">{active ? 'inspect on' : 'inspect'}</span>
      </button>

      <div className="floating-controls__divider" />

      <div className="floating-controls__dots">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`color-dot ${accent === color.value ? 'color-dot--active' : ''}`}
            style={{ '--dot-color': color.value } as React.CSSProperties}
            onClick={() => onAccentChange(color.value)}
            title={color.label}
            aria-label={`Use ${color.label} accent`}
          />
        ))}
      </div>
    </motion.div>
  )
}
