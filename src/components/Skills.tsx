import { skills } from '@/data/content'
import { useViewer } from '@/context/ViewerContext'
import { useAttentionFocused } from '@/context/AttentionModeContext'
import { tiltTransform } from '@/utils/parallax'

export function Skills() {
  const { state } = useViewer()
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tilt = reducedMotion ? '' : tiltTransform(state.x * 0.5, state.y * 0.5, 4)
  const attentionFocus = useAttentionFocused('section-services')

  return (
    <section
      id="section-services"
      className={`relative scroll-mt-20 py-20 md:py-28 transition-[box-shadow] duration-300 ${attentionFocus ? 'ring-2 ring-inset ring-accent/40' : ''}`}
      aria-labelledby="skills-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <h2 id="skills-heading" className="font-display text-center text-3xl font-bold text-white md:text-4xl">
          My <span className="text-accent">Technical Knowledge</span>
        </h2>
        <div
          className="mx-auto mt-14 grid gap-6 md:grid-cols-3"
          style={{
            transform: tilt,
            transition: reducedMotion ? 'none' : 'transform 0.2s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          {skills.groups.map((group) => (
            <div
              key={group.title}
              className="glass rounded-2xl p-8 text-center transition hover:border-white/10"
            >
              <h3 className="font-display text-lg font-semibold text-accent">{group.title}</h3>
              <p className="mt-4 font-body text-white/80">{group.items}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
