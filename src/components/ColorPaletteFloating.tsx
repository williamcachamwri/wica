import { motion } from 'framer-motion'

const ACCENT_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Violet', value: '#7c3aed' },
]

interface ColorPaletteFloatingProps {
  accent: string
  onAccentChange: (color: string) => void
}

export function ColorPaletteFloating({ accent, onAccentChange }: ColorPaletteFloatingProps) {
  return (
    <motion.div
      className="color-palette-floating"
      initial={{ opacity: 0, y: 24, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 0.6, delay: 0.1 }}
    >
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
    </motion.div>
  )
}
