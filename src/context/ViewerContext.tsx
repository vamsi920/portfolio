import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/**
 * Normalized viewport position for parallax: -1..1.
 * Used for 3D tilt and layer movement; supports mouse and optional camera.
 */
export interface ViewerState {
  x: number
  y: number
  source: 'mouse' | 'camera' | 'idle'
  cameraAllowed: boolean | null // null = not asked yet
}

const defaultState: ViewerState = {
  x: 0,
  y: 0,
  source: 'idle',
  cameraAllowed: null,
}

const ViewerContext = createContext<{
  state: ViewerState
  requestCamera: () => Promise<boolean>
  stopCamera: () => void
} | null>(null)

export function useViewer() {
  const ctx = useContext(ViewerContext)
  if (!ctx) throw new Error('useViewer must be used within ViewerProvider')
  return ctx
}

interface ViewerProviderProps {
  children: ReactNode
}

export function ViewerProvider({ children }: ViewerProviderProps) {
  const [state, setState] = useState<ViewerState>(defaultState)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Mouse move: normalize to -1..1
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion) return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setState((s) => ({ ...s, x, y, source: 'mouse' }))
    },
    [prefersReducedMotion]
  )

  // Idle: subtle drift when no input (reduced-motion safe: we use very slow animation)
  useEffect(() => {
    if (prefersReducedMotion) return
    let t = 0
    const interval = setInterval(() => {
      t += 0.02
      setState((s) => {
        if (s.source !== 'idle') return s
        const x = Math.sin(t) * 0.15
        const y = Math.cos(t * 0.7) * 0.1
        return { ...s, x, y }
      })
    }, 100)
    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [onMouseMove])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setState((s) => ({ ...s, source: 'idle', cameraAllowed: false }))
  }, [])

  const requestCamera = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState((s) => ({ ...s, cameraAllowed: false }))
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      streamRef.current = stream
      const video = document.createElement('video')
      video.setAttribute('playsinline', '')
      video.srcObject = stream
      videoRef.current = video
      await video.play()

      // FaceDetector (Chrome); fallback to mouse for other browsers
      const FaceDetector = (window as unknown as { FaceDetector?: new (opts?: { maxDetectedFaces?: number }) => { detect: (img: HTMLVideoElement) => Promise<{ boundingBox: DOMRectReadOnly }[]> } }).FaceDetector
      if (typeof FaceDetector === 'undefined') {
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setState((s) => ({ ...s, cameraAllowed: true }))
        return true // permission granted; we'll use mouse
      }

      const detector = new FaceDetector({ maxDetectedFaces: 1 })
      let running = true

      const tick = async () => {
        const v = videoRef.current
        if (!running || !v || !streamRef.current) return
        try {
          const faces = await detector.detect(v)
          if (faces.length > 0) {
            const face = faces[0]
            const b = face.boundingBox
            const x = (b.x + b.width / 2) / (v.videoWidth || 1) * 2 - 1
            const y = (b.y + b.height / 2) / (v.videoHeight || 1) * 2 - 1
            setState((s) => ({ ...s, x, y, source: 'camera' }))
          }
        } catch {
          // ignore detection errors
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)

      const onEnd = () => {
        running = false
        stopCamera()
      }
      stream.getVideoTracks()[0]?.addEventListener('ended', onEnd)

      setState((s) => ({ ...s, cameraAllowed: true, source: 'camera' }))
      return true
    } catch {
      setState((s) => ({ ...s, cameraAllowed: false }))
      return false
    }
  }, [stopCamera])

  const value = useMemo(
    () => ({ state, requestCamera, stopCamera }),
    [state, requestCamera, stopCamera]
  )

  return (
    <ViewerContext.Provider value={value}>
      {children}
    </ViewerContext.Provider>
  )
}
