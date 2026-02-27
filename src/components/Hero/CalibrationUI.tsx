import { useCallback, useEffect } from 'react'
import { useEyeTracking } from '@/context/EyeTrackingContext'

const CALIBRATION_POINTS = 9
const COLS = 3

/**
 * 9-point calibration grid. User looks at each dot and clicks to record position.
 */
export function CalibrationUI() {
  const { state, recordCalibrationPoint, stopEyeTracking } = useEyeTracking()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (state.status !== 'calibrating') return
      recordCalibrationPoint(e.clientX, e.clientY)
    },
    [state.status, recordCalibrationPoint]
  )

  // Escape to cancel calibration
  useEffect(() => {
    if (state.status !== 'calibrating') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopEyeTracking()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.status, stopEyeTracking])

  if (state.status !== 'calibrating') return null

  const current = state.calibrationStep
  const positions = Array.from({ length: CALIBRATION_POINTS }, (_, i) => {
    const row = Math.floor(i / COLS)
    const col = i % COLS
    const x = (col + 1) / (COLS + 1)
    const y = (row + 1) / (COLS + 1)
    return { x: x * 100, y: y * 100, index: i }
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-label="Calibration"
      aria-modal="true"
    >
      <p className="mb-8 font-body text-sm text-white/90">
        Look at each dot and click it ({current + 1} of {CALIBRATION_POINTS}). Press Esc to cancel.
      </p>
      <div className="relative h-[50vh] w-[80vw] max-w-md" style={{ perspective: '600px' }}>
        {positions.map(({ x, y, index }) => (
          <button
            key={index}
            type="button"
            className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-accent/30 text-white transition hover:border-accent hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-accent"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={handleClick}
            aria-label={`Calibration point ${index + 1}`}
          >
            {index === current ? (
              <span className="h-3 w-3 rounded-full bg-white" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white/60" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
