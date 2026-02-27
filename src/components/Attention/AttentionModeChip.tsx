import { useAttentionMode } from '@/context/AttentionModeContext'

/**
 * Opt-in chip for AI-like attention mode: highlights the section under gaze/cursor.
 * Fully local; no data sent. Respects prefers-reduced-motion (context disables highlight).
 */
export function AttentionModeChip() {
  const { enabled, setEnabled } = useAttentionMode()
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) return null

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 md:bottom-8">
      {enabled ? (
        <button
          type="button"
          onClick={() => setEnabled(false)}
          className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
          aria-label="Turn off attention mode"
          aria-pressed={true}
        >
          Attention on · Off
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEnabled(true)}
          className="rounded-full glass px-4 py-2 font-body text-xs text-white/80 transition hover:bg-white/10"
          aria-label="Enable attention mode (highlight section you focus on)"
          aria-pressed={false}
        >
          Attention mode
        </button>
      )}
    </div>
  )
}
