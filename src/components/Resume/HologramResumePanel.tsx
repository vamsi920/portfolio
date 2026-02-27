import { useViewer } from '@/context/ViewerContext'

interface HologramResumePanelProps {
  children: React.ReactNode
}

/**
 * Reactive "hologram resume" panel: layered glass with dynamic lighting
 * that follows head/eye position (from ViewerContext: mouse or WebGazer).
 */
export function HologramResumePanel({ children }: HologramResumePanelProps) {
  const { state } = useViewer()
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const cx = reducedMotion ? 50 : (state.x + 1) * 50
  const cy = reducedMotion ? 50 : (state.y + 1) * 50

  return (
    <div className="hologram-panel relative rounded-2xl overflow-hidden">
      {/* Outer hologram border / glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-60"
        style={{
          padding: 1,
          background: `linear-gradient(135deg, rgba(132,144,255,0.4), rgba(98,189,252,0.2), rgba(132,144,255,0.2))`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        aria-hidden
      />

      {/* Layered glass: back layer */}
      <div
        className="absolute inset-2 rounded-xl opacity-40"
        style={{
          background: 'rgb(var(--surface-muted) / 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        aria-hidden
      />

      {/* Main glass layer */}
      <div
        className="relative rounded-2xl"
        style={{
          background: 'rgb(var(--surface-muted) / 0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgb(255 255 255 / 0.06)',
          minHeight: 320,
        }}
      >
        {/* Dynamic light that follows viewer (head/eye) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          aria-hidden
          style={{
            background: `radial-gradient(
              circle at ${cx}% ${cy}%,
              rgba(132, 144, 255, 0.18) 0%,
              rgba(98, 189, 252, 0.06) 35%,
              transparent 55%
            )`,
            transition: reducedMotion ? 'none' : 'background 0.12s ease-out',
          }}
        />

        {/* Secondary highlight for depth */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden
          style={{
            background: `radial-gradient(
              circle at ${cx}% ${cy}%,
              rgba(255, 255, 255, 0.04) 0%,
              transparent 40%
            )`,
            transition: reducedMotion ? 'none' : 'background 0.12s ease-out',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8">{children}</div>
      </div>
    </div>
  )
}
