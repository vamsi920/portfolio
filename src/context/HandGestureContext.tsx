import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

/** Hand gesture state: pinch zoom (profile), swipe rotate (timeline), open palm = reset */
export interface HandGestureState {
  status: 'idle' | 'consent' | 'loading' | 'active' | 'unavailable'
  /** Profile card scale (1 = default) */
  profileScale: number
  /** Timeline cards rotation in degrees */
  timelineRotation: number
}

const DEFAULT_SCALE = 1
const DEFAULT_ROTATION = 0
const SCALE_MIN = 0.5
const SCALE_MAX = 2.2
const ROTATION_MAX = 25
const PINCH_REF_DISTANCE = 0.1
const SWIPE_SENSITIVITY = 0.5
const OPEN_PALM_HOLD_MS = 600
const SCALE_SMOOTH = 0.12

const HandGestureContext = createContext<{
  state: HandGestureState
  requestConsent: () => void
  acceptConsent: () => Promise<void>
  declineConsent: () => void
  stopHandGestures: () => void
  resetView: () => void
} | null>(null)

export function useHandGestures() {
  const ctx = useContext(HandGestureContext)
  if (!ctx) throw new Error('useHandGestures must be used within HandGestureProvider')
  return ctx
}

interface HandGestureProviderProps {
  children: ReactNode
}

export function HandGestureProvider({ children }: HandGestureProviderProps) {
  const [state, setState] = useState<HandGestureState>({
    status: 'idle',
    profileScale: DEFAULT_SCALE,
    timelineRotation: DEFAULT_ROTATION,
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<{ detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks: Array<Array<{ x: number; y: number }>> }; close: () => void } | null>(null)
  const rafRef = useRef<number>(0)
  const openPalmSinceRef = useRef<number | null>(null)

  const resetView = useCallback(() => {
    setState((s) => ({
      ...s,
      profileScale: DEFAULT_SCALE,
      timelineRotation: DEFAULT_ROTATION,
    }))
  }, [])

  const stopHandGestures = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }
    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close()
      } catch {
        // ignore
      }
      landmarkerRef.current = null
    }
    setState({
      status: 'idle',
      profileScale: DEFAULT_SCALE,
      timelineRotation: DEFAULT_ROTATION,
    })
  }, [])

  const requestConsent = useCallback(() => {
    setState((s) => ({ ...s, status: 'consent' }))
  }, [])

  const declineConsent = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle' }))
  }, [])

  const acceptConsent = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }))
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setState((s) => ({ ...s, status: 'unavailable' }))
      return
    }
    try {
      const vision = await import('@mediapipe/tasks-vision')
      const { FilesetResolver, HandLandmarker } = vision
      const wasm = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      const visionResolver = await FilesetResolver.forVisionTasks(wasm)
      const modelPath =
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
      const landmarker = await HandLandmarker.createFromOptions(visionResolver, {
        baseOptions: { modelAssetPath: modelPath },
        numHands: 1,
        runningMode: 'VIDEO',
      })
      landmarkerRef.current = landmarker as unknown as typeof landmarkerRef.current

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })
      streamRef.current = stream
      const video = document.createElement('video')
      video.setAttribute('playsinline', '')
      video.srcObject = stream
      videoRef.current = video
      await video.play()

      let lastPalmX = 0.5
      let currentScale = DEFAULT_SCALE

      const detect = async () => {
        const v = videoRef.current
        const lm = landmarkerRef.current
        if (!v || !lm || !streamRef.current || v.readyState < 2) {
          rafRef.current = requestAnimationFrame(detect)
          return
        }
        const now = performance.now()
        const result = lm.detectForVideo(v, now)
        rafRef.current = requestAnimationFrame(detect)

        if (!result.landmarks?.length) {
          openPalmSinceRef.current = null
          return
        }
        const hand = result.landmarks[0]
        if (!hand || hand.length < 21) return

        const thumbTip = hand[4]
        const indexTip = hand[8]
        const wrist = hand[0]
        const middleTip = hand[12]
        const ringTip = hand[16]
        const pinkyTip = hand[20]

        const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
          Math.hypot(a.x - b.x, a.y - b.y)

        const pinchDist = dist(thumbTip, indexTip)
        const palmCenter = { x: wrist.x, y: wrist.y }

        const targetScale = Math.max(
          SCALE_MIN,
          Math.min(SCALE_MAX, PINCH_REF_DISTANCE / Math.max(0.03, pinchDist))
        )
        currentScale += (targetScale - currentScale) * SCALE_SMOOTH
        setState((s) => ({ ...s, profileScale: currentScale }))

        const dx = palmCenter.x - lastPalmX
        lastPalmX = palmCenter.x
        if (Math.abs(dx) > 0.008) {
          setState((s) => ({
            ...s,
            timelineRotation: Math.max(
              -ROTATION_MAX,
              Math.min(ROTATION_MAX, s.timelineRotation + dx * SWIPE_SENSITIVITY * 80)
            ),
          }))
        }

        const tips = [thumbTip, indexTip, middleTip, ringTip, pinkyTip]
        const distFromWrist = tips.map((t) => dist(t, wrist))
        const allExtended = distFromWrist.every((d) => d > 0.14)
        if (allExtended) {
          const t = openPalmSinceRef.current ?? now
          openPalmSinceRef.current = t
          if (now - t > OPEN_PALM_HOLD_MS) {
            resetView()
            currentScale = DEFAULT_SCALE
            openPalmSinceRef.current = null
          }
        } else {
          openPalmSinceRef.current = null
        }
      }

      rafRef.current = requestAnimationFrame(detect)
      setState((s) => ({ ...s, status: 'active' }))
    } catch {
      setState((s) => ({ ...s, status: 'unavailable' }))
    }
  }, [resetView])

  const value = {
    state,
    requestConsent,
    acceptConsent,
    declineConsent,
    stopHandGestures,
    resetView,
  }

  return (
    <HandGestureContext.Provider value={value}>
      {children}
    </HandGestureContext.Provider>
  )
}
