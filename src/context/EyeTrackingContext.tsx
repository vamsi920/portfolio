import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { WebGazerAPI, WebGazerGazeData } from '@/types/webgazer'

/** Hero eye-tracking: consent → calibration → gaze-driven parallax; fallback to mouse */
export type EyeTrackingStatus =
  | 'idle'           // not asked
  | 'consent'        // showing consent gate
  | 'loading'        // starting WebGazer
  | 'calibrating'    // 9-point calibration
  | 'active'         // gaze listener running
  | 'unavailable'   // denied or error
  | 'fallback'       // using mouse

export interface EyeTrackingState {
  status: EyeTrackingStatus
  /** Normalized -1..1 for parallax (when active or fallback) */
  x: number
  y: number
  /** Current calibration point 0..8 */
  calibrationStep: number
}

const defaultState: EyeTrackingState = {
  status: 'idle',
  x: 0,
  y: 0,
  calibrationStep: 0,
}

const CALIBRATION_POINTS = 9

const EyeTrackingContext = createContext<{
  state: EyeTrackingState
  requestConsent: () => void
  acceptConsent: () => Promise<void>
  declineConsent: () => void
  recordCalibrationPoint: (clientX: number, clientY: number) => void
  stopEyeTracking: () => void
} | null>(null)

export function useEyeTracking() {
  const ctx = useContext(EyeTrackingContext)
  if (!ctx) throw new Error('useEyeTracking must be used within EyeTrackingProvider')
  return ctx
}

interface EyeTrackingProviderProps {
  children: ReactNode
  /** Mouse (x,y) normalized -1..1 when not using gaze (fallback) */
  mouseNorm: { x: number; y: number }
}

export function EyeTrackingProvider({ children, mouseNorm }: EyeTrackingProviderProps) {
  const [state, setState] = useState<EyeTrackingState>(defaultState)
  const webgazerRef = useRef<WebGazerAPI | null>(null)
  const gazeListenerRef = useRef<((data: WebGazerGazeData | null) => void) | null>(null)

  const stopEyeTracking = useCallback(() => {
    const wg = webgazerRef.current
    if (wg) {
      try {
        wg.clearGazeListener()
        wg.removeMouseEventListeners()
        wg.end()
      } catch {
        // ignore
      }
      webgazerRef.current = null
    }
    gazeListenerRef.current = null
    setState({
      status: 'fallback',
      x: mouseNorm.x,
      y: mouseNorm.y,
      calibrationStep: 0,
    })
  }, [mouseNorm.x, mouseNorm.y])

  const requestConsent = useCallback(() => {
    setState((s) => ({ ...s, status: 'consent' }))
  }, [])

  const declineConsent = useCallback(() => {
    setState((s) => ({ ...s, status: 'fallback', x: mouseNorm.x, y: mouseNorm.y }))
  }, [mouseNorm.x, mouseNorm.y])

  const acceptConsent = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }))
    let wg: WebGazerAPI
    try {
      const mod = await import('webgazer')
      wg = (mod.default ?? mod) as WebGazerAPI
      if (!wg || typeof wg.begin !== 'function') {
        setState((s) => ({ ...s, status: 'unavailable' }))
        return
      }
      if (!wg.detectCompatibility?.()) {
        setState((s) => ({ ...s, status: 'unavailable' }))
        return
      }
      wg.showVideo(false)
      wg.showPredictionPoints(false)
      await wg.begin(() => {
        setState((s) => ({ ...s, status: 'unavailable' }))
      })
      webgazerRef.current = wg
      wg.addMouseEventListeners()
      setState((s) => ({
        ...s,
        status: 'calibrating',
        calibrationStep: 0,
      }))
    } catch {
      setState((s) => ({ ...s, status: 'unavailable' }))
    }
  }, [])

  const recordCalibrationPoint = useCallback((clientX: number, clientY: number) => {
    const wg = webgazerRef.current
    if (!wg || state.status !== 'calibrating') return
    wg.recordScreenPosition(clientX, clientY, 'click')
    const next = state.calibrationStep + 1
    if (next >= CALIBRATION_POINTS) {
      const listener = (data: WebGazerGazeData | null) => {
        if (data != null) {
          const x = (data.x / window.innerWidth) * 2 - 1
          const y = (data.y / window.innerHeight) * 2 - 1
          setState((s) => ({ ...s, x, y, status: 'active' }))
        }
      }
      gazeListenerRef.current = listener
      wg.setGazeListener((data, _elapsed) => listener(data as WebGazerGazeData | null))
      setState((s) => ({
        ...s,
        status: 'active',
        calibrationStep: 0,
      }))
    } else {
      setState((s) => ({ ...s, calibrationStep: next }))
    }
  }, [state.status, state.calibrationStep])

  // When not active (gaze), keep x,y in sync with mouse (hero parallax fallback)
  useEffect(() => {
    if (state.status === 'active') return
    setState((s) => ({ ...s, x: mouseNorm.x, y: mouseNorm.y }))
  }, [mouseNorm.x, mouseNorm.y, state.status])

  const value = {
    state,
    requestConsent,
    acceptConsent,
    declineConsent,
    recordCalibrationPoint,
    stopEyeTracking,
  }

  return (
    <EyeTrackingContext.Provider value={value}>
      {children}
    </EyeTrackingContext.Provider>
  )
}
