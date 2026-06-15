let audioCtx: AudioContext | null = null
let muted = false

const SOUND_KEY = 'ddt-sound-muted'

export function initSound() {
  if (typeof window === 'undefined') return
  muted = localStorage.getItem(SOUND_KEY) === 'true'
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  if (typeof window !== 'undefined') {
    localStorage.setItem(SOUND_KEY, value ? 'true' : 'false')
  }
}

export function toggleMuted(): boolean {
  setMuted(!muted)
  return !muted
}

function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (Ctx) {
      audioCtx = new Ctx()
    }
  }
  return audioCtx
}

function playTone({ frequency, type, duration, volume }: { frequency: number; type: OscillatorType; duration: number; volume: number }) {
  if (muted) return
  const ctx = ensureAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playClick() {
  playTone({ frequency: 880, type: 'sine', duration: 0.06, volume: 0.04 })
}

export function playSoftClick() {
  playTone({ frequency: 600, type: 'triangle', duration: 0.05, volume: 0.03 })
}

export function playToggle() {
  playTone({ frequency: 440, type: 'sine', duration: 0.08, volume: 0.035 })
}
