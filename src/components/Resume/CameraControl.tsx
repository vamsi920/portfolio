import { useViewer } from '@/context/ViewerContext'

/**
 * Optional webcam-based reactive view. Privacy-first: only after user consent.
 * Fallback: mouse parallax + subtle idle animation when camera denied/unavailable.
 */
export function CameraControl() {
  const { state, requestCamera, stopCamera } = useViewer()
  const { cameraAllowed, source } = state

  const handleToggle = async () => {
    if (source === 'camera' || cameraAllowed === true) {
      stopCamera()
      return
    }
    const ok = await requestCamera()
    if (!ok) {
      // Could show a small toast: "Camera denied — using mouse"
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl glass px-4 py-3">
      <span className="font-body text-sm text-white/80">
        {source === 'camera' ? 'Camera on — view follows you' : 'Move cursor for parallax'}
      </span>
      {cameraAllowed === null && (
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-lg bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/30"
          aria-label="Enable camera for reactive view (optional)"
        >
          Use camera
        </button>
      )}
      {(cameraAllowed === true || source === 'camera') && (
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/20"
          aria-label="Turn off camera"
        >
          {source === 'camera' ? 'Turn off' : 'Camera on'}
        </button>
      )}
    </div>
  )
}
