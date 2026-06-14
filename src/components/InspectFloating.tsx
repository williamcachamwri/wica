import { motion } from 'framer-motion'

interface InspectFloatingProps {
  active: boolean
  onToggle: () => void
}

export function InspectFloating({ active, onToggle }: InspectFloatingProps) {
  return (
    <motion.button
      type="button"
      className={`inspect-floating${active ? ' inspect-floating--active' : ''}`}
      onClick={onToggle}
      title={active ? 'Disable inspector' : 'Enable inspector'}
      initial={{ opacity: 0, y: 24, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 0.6 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="inspect-floating__icon"
        animate={{ rotate: active ? 180 : 0, color: active ? 'var(--accent)' : undefined }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        ◈
      </motion.span>
      <span className="inspect-floating__label">{active ? 'inspect on' : 'inspect'}</span>
    </motion.button>
  )
}
