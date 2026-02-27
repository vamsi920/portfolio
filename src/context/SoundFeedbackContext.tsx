import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/**
 * Spatial audio micro-feedback: optional toggle, no autoplay.
 * AudioContext is created only after user enables (user gesture).
 * playFeedback() plays a short tone with stereo pan from x (0–1).
 */
export type SoundFeedbackType = 'click' | 'hover'

interface SoundFeedbackContextValue {
  enabled: boolean
  setEnabled: (value: boolean) => void
  /** Play a short tone. x in 0–1 for stereo pan (0.5 = center). Only plays if enabled and after user gesture. */
  playFeedback: (type?: SoundFeedbackType, x?: number) => void
}

const SoundFeedbackContext = createContext<SoundFeedbackContextValue | null>(null)

export function useSoundFeedback() {
  const ctx = useContext(SoundFeedbackContext)
  if (!ctx) throw new Error('useSoundFeedback must be used within SoundFeedbackProvider')
  return ctx
}

interface SoundFeedbackProviderProps {
  children: ReactNode
}

export function SoundFeedbackProvider({ children }: SoundFeedbackProviderProps) {
  const [enabled, setEnabledState] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const setEnabled = useCallback((value: boolean) => {
    if (value && typeof window !== 'undefined' && !audioContextRef.current) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioContextRef.current = ctx
      ctx.resume()
    }
    setEnabledState(value)
  }, [])

  const playFeedback = useCallback((type: SoundFeedbackType = 'click', x = 0.5) => {
    if (!enabled || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = audioContextRef.current
    if (!ctx || ctx.state === 'closed') return

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const panner = ctx.createStereoPanner()

    const freq = type === 'hover' ? 520 : 680
    const dur = type === 'hover' ? 0.04 : 0.06
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    panner.pan.setValueAtTime((x - 0.5) * 2, now)

    osc.connect(gain)
    gain.connect(panner)
    panner.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + dur)
  }, [enabled])

  const value: SoundFeedbackContextValue = {
    enabled,
    setEnabled,
    playFeedback,
  }

  return (
    <SoundFeedbackContext.Provider value={value}>
      {children}
    </SoundFeedbackContext.Provider>
  )
}
