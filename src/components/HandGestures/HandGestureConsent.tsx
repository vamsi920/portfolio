import { useHandGestures } from '@/context/HandGestureContext'
import { useSoundFeedback } from '@/context/SoundFeedbackContext'

export function HandGestureConsent() {
  const { state, acceptConsent, declineConsent } = useHandGestures()
  const { playFeedback } = useSoundFeedback()

  if (state.status !== 'consent') return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="hand-consent-title"
      aria-modal="true"
    >
      <div className="glass-strong mx-4 max-w-md rounded-2xl p-6 shadow-xl">
        <h2 id="hand-consent-title" className="font-display text-lg font-semibold text-white">
          Hand-gesture controls
        </h2>
        <p className="mt-3 font-body text-sm text-white/80">
          Use your camera to control the site: <strong>pinch</strong> to zoom the profile card,{' '}
          <strong>swipe</strong> to rotate the timeline, and show an <strong>open palm</strong> to
          reset. All processing happens in your browser.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={declineConsent}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 font-body text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={(e) => {
              playFeedback('click', e.clientX / window.innerWidth)
              acceptConsent()
            }}
            className="flex-1 rounded-xl bg-accent/90 px-4 py-2.5 font-body text-sm font-medium text-white transition hover:bg-accent"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  )
}
