import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

/**
 * Face-distance depth mode: estimate face size from camera (proxy for distance)
 * and map to smooth scene scale. Closer face = larger bbox = scale up; farther = scale down.
 */
export type FaceDepthStatus = 'idle' | 'consent' | 'loading' | 'active' | 'unavailable'

export interface FaceDepthState {
  status: FaceDepthStatus
  /** 0 = far, 1 = close; smoothed for stable scene changes */
  depthNormalized: number
  /** Derived scale for scene (e.g. 0.92–1.08) */
  sceneScale: number
}

const DEPTH_SMOOTH = 0.07
const SCALE_MIN = 0.92
const SCALE_MAX = 1.08
const FACE_AREA_REF = 0.08

const FaceDepthContext = createContext<{
  state: FaceDepthState
  requestConsent: () => void
  acceptConsent: () => Promise<void>
  declineConsent: () => void
  stopDepthMode: () => void
} | null>(null)

export function useFaceDepth() {
  const ctx = useContext(FaceDepthContext)
  if (!ctx) throw new Error('useFaceDepth must be used within FaceDepthProvider')
  return ctx
}

interface FaceDepthProviderProps {
  children: ReactNode
}

export function FaceDepthProvider({ children }: FaceDepthProviderProps) {
  const [state, setState] = useState<FaceDepthState>({
    status: 'idle',
    depthNormalized: 0.5,
    sceneScale: 1,
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<{
    detectForVideo: (v: HTMLVideoElement, t: number) => { detections: Array<{ boundingBox?: { width: number; height: number } }> }
    close: () => void
  } | null>(null)
  const rafRef = useRef<number>(0)
  const smoothedDepthRef = useRef(0.5)

  const stopDepthMode = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }
    if (detectorRef.current) {
      try {
        detectorRef.current.close()
      } catch {
        // ignore
      }
      detectorRef.current = null
    }
    setState({
      status: 'idle',
      depthNormalized: 0.5,
      sceneScale: 1,
    })
    smoothedDepthRef.current = 0.5
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
      const { FilesetResolver, FaceDetector } = vision
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const wasmBase = `${base}/mediapipe-wasm`
      const visionResolver = await FilesetResolver.forVisionTasks(wasmBase)
      const modelPath =
        'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
      const detector = await FaceDetector.createFromOptions(visionResolver, {
        baseOptions: { modelAssetPath: modelPath },
        runningMode: 'VIDEO',
      })
      detectorRef.current = detector as unknown as typeof detectorRef.current

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      })
      streamRef.current = stream
      const video = document.createElement('video')
      video.setAttribute('playsinline', '')
      video.setAttribute('muted', '')
      video.autoplay = true
      video.srcObject = stream
      videoRef.current = video
      await video.play()

      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          resolve()
          return
        }
        const onReady = () => {
          video.removeEventListener('loadeddata', onReady)
          video.removeEventListener('error', onError)
          if (video.videoWidth > 0) resolve()
          else reject(new Error('Video has no dimensions'))
        }
        const onError = () => {
          video.removeEventListener('loadeddata', onReady)
          video.removeEventListener('error', onError)
          reject(new Error('Video failed to load'))
        }
        video.addEventListener('loadeddata', onReady)
        video.addEventListener('error', onError)
        setTimeout(() => {
          video.removeEventListener('loadeddata', onReady)
          video.removeEventListener('error', onError)
          if (video.readyState >= 2 && video.videoWidth > 0) resolve()
          else reject(new Error('Video timeout'))
        }, 3000)
      })

      const detect = () => {
        const v = videoRef.current
        const det = detectorRef.current
        if (!v || !det || !streamRef.current || v.readyState < 2 || v.videoWidth === 0) {
          rafRef.current = requestAnimationFrame(detect)
          return
        }
        const nowMs = performance.now()
        const result = det.detectForVideo(v, nowMs)
        rafRef.current = requestAnimationFrame(detect)

        const detections = result.detections
        if (!detections?.length) {
          return
        }
        const first = detections[0]
        const box = first.boundingBox
        if (box == null || typeof box.width !== 'number' || typeof box.height !== 'number') return

        const area = box.width * box.height
        const frameArea = (v.videoWidth || 1) * (v.videoHeight || 1)
        const normalizedArea = Math.min(1, area / frameArea)
        const rawDepth = Math.min(1, Math.max(0, normalizedArea / FACE_AREA_REF))

        smoothedDepthRef.current += (rawDepth - smoothedDepthRef.current) * DEPTH_SMOOTH
        const d = smoothedDepthRef.current
        const scale = SCALE_MIN + d * (SCALE_MAX - SCALE_MIN)

        setState((s) => ({
          ...s,
          depthNormalized: d,
          sceneScale: scale,
        }))
      }

      rafRef.current = requestAnimationFrame(detect)
      setState((s) => ({ ...s, status: 'active' }))
    } catch (err) {
      console.warn('Face depth init failed:', err)
      setState((s) => ({ ...s, status: 'unavailable' }))
    }
  }, [])

  const value = {
    state,
    requestConsent,
    acceptConsent,
    declineConsent,
    stopDepthMode,
  }

  return (
    <FaceDepthContext.Provider value={value}>
      {children}
    </FaceDepthContext.Provider>
  )
}
