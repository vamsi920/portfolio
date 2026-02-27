import { useEyeTracking } from '@/context/EyeTrackingContext'
import { EyeTrackingConsent } from './EyeTrackingConsent'
import { CalibrationUI } from './CalibrationUI'
import { HeroParallax } from './HeroParallax'

/**
 * Hero section with WebGazer eye-tracking parallax, consent gate, calibration, and fallback to mouse.
 */
export function HeroWithEyeTracking() {
  const { state, requestConsent, stopEyeTracking } = useEyeTracking()
  const showChip = state.status === 'idle' || state.status === 'fallback' || state.status === 'active'

  return (
    <>
      <EyeTrackingConsent />
      <CalibrationUI />
      <HeroParallax />
      {showChip && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 md:bottom-8 md:left-8 md:translate-x-0">
          {state.status === 'active' ? (
            <button
              type="button"
              onClick={stopEyeTracking}
              className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
              aria-label="Turn off eye tracking"
            >
              Eye tracking on · Click to turn off
            </button>
          ) : (
            <button
              type="button"
              onClick={requestConsent}
              className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
              aria-label="Try eye tracking for hero parallax"
            >
              Try eye tracking
            </button>
          )}
        </div>
      )}
    </>
  )
}
