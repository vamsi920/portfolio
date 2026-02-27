import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useViewer } from '@/context/ViewerContext'
import { useEyeTracking } from '@/context/EyeTrackingContext'

/**
 * Section IDs that participate in attention (heat-zone) hit-testing.
 * Order matches DOM order for consistent "topmost" section when overlapping.
 */
export const ATTENTION_SECTION_IDS = [
  'section-home',
  'section-about',
  'section-resume',
  'section-services',
  'section-contact',
] as const

export type AttentionSectionId = (typeof ATTENTION_SECTION_IDS)[number]

interface AttentionModeContextValue {
  enabled: boolean
  setEnabled: (value: boolean) => void
  /** Section id currently under gaze/cursor when enabled, null otherwise */
  focusedSectionId: AttentionSectionId | null
}

const AttentionModeContext = createContext<AttentionModeContextValue | null>(null)

export function useAttentionMode() {
  const ctx = useContext(AttentionModeContext)
  if (!ctx) throw new Error('useAttentionMode must be used within AttentionModeProvider')
  return ctx
}

/** Returns whether the given section id is the current focus (for applying highlight). */
export function useAttentionFocused(sectionId: string): boolean {
  const { enabled, focusedSectionId } = useAttentionMode()
  return enabled && focusedSectionId === sectionId
}

interface AttentionModeProviderProps {
  children: ReactNode
}

function hitTestSectionIds(clientX: number, clientY: number): AttentionSectionId | null {
  for (const id of ATTENTION_SECTION_IDS) {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return id
    }
  }
  return null
}

export function AttentionModeProvider({ children }: AttentionModeProviderProps) {
  const [enabled, setEnabled] = useState(false)
  const [focusedSectionId, setFocusedSectionId] = useState<AttentionSectionId | null>(null)
  const { state: viewerState } = useViewer()
  const { state: eyeState } = useEyeTracking()
  const rafRef = useRef<number>(0)

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setFocusedSectionId(null)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = () => {
      const x = eyeState.status === 'active' ? eyeState.x : viewerState.x
      const y = eyeState.status === 'active' ? eyeState.y : viewerState.y
      const clientX = ((x + 1) / 2) * (typeof window !== 'undefined' ? window.innerWidth : 1024)
      const clientY = ((y + 1) / 2) * (typeof window !== 'undefined' ? window.innerHeight : 768)
      const id = hitTestSectionIds(clientX, clientY)
      setFocusedSectionId((prev) => (prev !== id ? id : prev))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, reducedMotion, viewerState.x, viewerState.y, eyeState.status, eyeState.x, eyeState.y])

  const value: AttentionModeContextValue = {
    enabled,
    setEnabled,
    focusedSectionId,
  }

  return (
    <AttentionModeContext.Provider value={value}>
      {children}
    </AttentionModeContext.Provider>
  )
}
