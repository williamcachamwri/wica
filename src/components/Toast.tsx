import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

let toastId = 0
const listeners = new Set<(toasts: ToastItem[]) => void>()
let toasts: ToastItem[] = []

export type ToastType = 'default' | 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

function notify() {
  listeners.forEach((listener) => listener([...toasts]))
}

export function showToast(message: string, type: ToastType = 'default') {
  const id = ++toastId
  toasts = [...toasts, { id, message, type }]
  notify()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, 2200)
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'default') return null
  const bg = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : 'var(--accent)'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'i'
  return (
    <span className="toast-icon" style={{ background: bg }}>
      {icon}
    </span>
  )
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    listeners.add(setItems)
    setItems([...toasts])
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {items.map((toast) => (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.94, transition: { duration: 0.2 } }}
            layout
          >
            <ToastIcon type={toast.type} />
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
