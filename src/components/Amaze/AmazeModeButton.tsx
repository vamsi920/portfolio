import { useAmazeMode } from '@/context/AmazeModeContext'

/**
 * One-click "Amaze mode" demo entry and off switch.
 * When active, shows Exit so user can stop the sequence.
 */
export function AmazeModeButton() {
  const { active, stopDemo } = useAmazeMode()
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) return null

  if (active) {
    return (
      <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 md:top-24">
        <button
          type="button"
          onClick={stopDemo}
          className="rounded-full glass px-5 py-2.5 font-body text-sm font-medium text-white/90 shadow-lg transition hover:bg-white/15"
          aria-label="Exit Amaze mode and stop demo"
        >
          Exit Amaze
        </button>
      </div>
    )
  }

  return null
}
