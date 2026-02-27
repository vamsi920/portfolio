import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useSoundFeedback } from '@/context/SoundFeedbackContext'
import { useAttentionMode } from '@/context/AttentionModeContext'

/** Particle count during Amaze mode to stay within performance budget */
export const AMAZE_PARTICLE_BUDGET = 22

const STEP_DELAY_MS = 2800

function scrollToSection(id: string) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

interface AmazeModeContextValue {
  active: boolean
  /** Start the one-click demo sequence; runs scroll + enables sound/attention. */
  startDemo: () => void
  /** Stop the demo and clear all scheduled steps. */
  stopDemo: () => void
  /** True while demo is running; use for performance budget (e.g. fewer particles). */
  performanceBudget: boolean
}

const AmazeModeContext = createContext<AmazeModeContextValue | null>(null)

export function useAmazeMode() {
  const ctx = useContext(AmazeModeContext)
  if (!ctx) throw new Error('useAmazeMode must be used within AmazeModeProvider')
  return ctx
}

interface AmazeModeProviderProps {
  children: ReactNode
}

export function AmazeModeProvider({ children }: AmazeModeProviderProps) {
  const [active, setActive] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const { setEnabled: setSoundEnabled, playFeedback } = useSoundFeedback()
  const { setEnabled: setAttentionEnabled } = useAttentionMode()

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  const stopDemo = useCallback(() => {
    clearAll()
    setActive(false)
  }, [clearAll])

  const startDemo = useCallback(() => {
    if (active) return
    clearAll()
    setActive(true)

    const schedule = (fn: () => void, delayMs: number) => {
      const id = setTimeout(() => {
        if (!timeoutsRef.current.includes(id)) return
        fn()
      }, delayMs)
      timeoutsRef.current.push(id)
    }

    schedule(() => {
      setSoundEnabled(true)
      setAttentionEnabled(true)
      playFeedback('click', 0.5)
    }, 0)

    schedule(() => scrollToSection('section-home'), 400)
    schedule(() => scrollToSection('section-about'), 400 + STEP_DELAY_MS)
    schedule(() => scrollToSection('section-resume'), 400 + STEP_DELAY_MS * 2)
    schedule(() => scrollToSection('section-services'), 400 + STEP_DELAY_MS * 3)
    schedule(() => scrollToSection('section-contact'), 400 + STEP_DELAY_MS * 4)

    schedule(() => {
      setActive(false)
      clearAll()
    }, 400 + STEP_DELAY_MS * 5 + 800)
  }, [active, clearAll, setSoundEnabled, setAttentionEnabled, playFeedback])

  const value: AmazeModeContextValue = {
    active,
    startDemo,
    stopDemo,
    performanceBudget: active,
  }

  return (
    <AmazeModeContext.Provider value={value}>
      {children}
    </AmazeModeContext.Provider>
  )
}
