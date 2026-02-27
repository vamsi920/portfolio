import { useViewer } from '@/context/ViewerContext'
import { tiltTransform } from '@/utils/parallax'
import { experience, projects } from '@/data/content'
import type { ExperienceItem, ProjectItem } from '@/data/content'

function ExperienceCard({ item }: { item: ExperienceItem }) {
  return (
    <article className="glass rounded-2xl p-6 transition hover:border-white/10">
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

function ProjectCard({ item }: { item: ProjectItem }) {
  return (
    <article className="glass rounded-2xl p-6 transition hover:border-white/10">
      <h3 className="font-display text-lg font-semibold text-white">{item.name}</h3>
      <p className="mt-2 font-body text-white/80">{item.description}</p>
      {item.links && item.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {item.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

export function ResumeSection() {
  const { state } = useViewer()
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tilt = reducedMotion ? '' : tiltTransform(state.x, state.y, 6)
  const transition = reducedMotion ? 'none' : 'transform 0.15s ease-out'

  return (
    <section
      id="section-resume"
      className="relative scroll-mt-20 py-20 md:py-28"
      aria-labelledby="resume-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <h2 id="resume-heading" className="font-display text-center text-3xl font-bold text-white md:text-4xl">
          My <span className="text-accent">Works and Activity</span>
        </h2>

        {/* 3D parallax wrapper — screen responds to viewer */}
        <div
          className="mx-auto mt-14 max-w-4xl"
          style={{
            transform: tilt,
            transition,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="space-y-12">
            <div>
              <h3 className="mb-6 font-display text-xl font-semibold text-white/90">Experience</h3>
              <div className="space-y-4">
                {experience.map((item, i) => (
                  <ExperienceCard key={`${item.org}-${i}`} item={item} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-6 font-display text-xl font-semibold text-white/90">Projects</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((item, i) => (
                  <ProjectCard key={`${item.name}-${i}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
