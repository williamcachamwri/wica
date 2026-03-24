import { useEffect, useState } from 'react'

let toastId = 0
const listeners = new Set<(toasts: ToastItem[]) => void>()
let toasts: ToastItem[] = []

interface ToastItem {
  id: number
  message: string
}

function notify() {
  listeners.forEach((listener) => listener([...toasts]))
}

export function showToast(message: string) {
  const id = ++toastId
  toasts = [...toasts, { id, message }]
  notify()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, 2200)
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    listeners.add(setItems)
    setItems([...toasts])
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {items.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      ))}
    </div>
  )
}
/* feb2e053 */
