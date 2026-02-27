/**
 * Face Detector API (Chrome). Used for optional camera-based parallax.
 * https://developer.mozilla.org/en-US/docs/Web/API/FaceDetector
 */
interface FaceDetectorOptions {
  maxDetectedFaces?: number
  fastMode?: boolean
}

interface DetectedFace {
  boundingBox: DOMRectReadOnly
  landmarks?: unknown
}

declare class FaceDetector {
  constructor(options?: FaceDetectorOptions)
  detect(image: CanvasImageSource): Promise<DetectedFace[]>
}

interface Window {
  FaceDetector?: typeof FaceDetector
}
