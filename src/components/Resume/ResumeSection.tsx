import { useViewer } from '@/context/ViewerContext'
import { useHandGestures } from '@/context/HandGestureContext'
import { useAttentionFocused } from '@/context/AttentionModeContext'
import { tiltTransform } from '@/utils/parallax'
import { experience } from '@/data/content'
import type { ExperienceItem } from '@/data/content'
import { HologramResumePanel } from './HologramResumePanel'
import { ProjectGallery } from './ProjectGallery'

function ExperienceCard({ item }: { item: ExperienceItem }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/[0.07] hover:border-white/15">
      <p className="mb-2 flex items-center gap-2 text-sm text-white/60">
        <span aria-hidden>📅</span>
        {item.date}
      </p>
      <h3 className="font-display text-lg font-semibold text-white">{item.org}</h3>
      <p className="mt-1 text-accent">{item.role}</p>
      {item.description && <p className="mt-3 font-body text-white/80">{item.description}</p>}
      {item.link && (
        <a
          href={item.link.href}
          className="mt-3 inline-block text-sm text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.link.label}
        </a>
      )}
    </article>
  )
}

export function ResumeSection() {
  const { state } = useViewer()
  const { state: gesture } = useHandGestures()
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tilt = reducedMotion ? '' : tiltTransform(state.x, state.y, 6)
  const transition = reducedMotion ? 'none' : 'transform 0.15s ease-out'
  const rotateDeg = reducedMotion || gesture.status !== 'active' ? 0 : gesture.timelineRotation
  const attentionFocus = useAttentionFocused('section-resume')

  return (
    <section
      id="section-resume"
      className={`relative scroll-mt-20 py-20 md:py-28 transition-[box-shadow] duration-300 ${attentionFocus ? 'ring-2 ring-inset ring-accent/40' : ''}`}
      aria-labelledby="resume-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <h2 id="resume-heading" className="font-display text-center text-3xl font-bold text-white md:text-4xl">
          My <span className="text-accent">Works and Activity</span>
        </h2>

        {/* 3D parallax + hand-gesture rotation + hologram panel */}
        <div
          className="mx-auto mt-14 max-w-4xl transition-transform duration-150 ease-out"
          style={{
            transform: `${tilt} rotate(${rotateDeg}deg)`,
            transition,
            transformStyle: 'preserve-3d',
          }}
        >
          <HologramResumePanel>
            <div className="space-y-10">
              <div>
                <h3 className="mb-4 font-display text-lg font-semibold text-white/95">Experience</h3>
                <div className="space-y-3">
                  {experience.map((item, i) => (
                    <ExperienceCard key={`${item.org}-${i}`} item={item} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 font-display text-lg font-semibold text-white/95">Projects</h3>
                <ProjectGallery />
              </div>
            </div>
          </HologramResumePanel>
        </div>
      </div>
    </section>
  )
}
