import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.01,
    filter: 'blur(6px)',
  },
}

const pageTransition = {
  type: 'spring',
  stiffness: 220,
  damping: 26,
  mass: 0.8,
}

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ willChange: 'transform, opacity, filter' }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
/* d53b9596 */
