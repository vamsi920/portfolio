import { about, site } from '@/data/content'
import { useHandGestures } from '@/context/HandGestureContext'
import { useAttentionFocused } from '@/context/AttentionModeContext'
import { TechSphere } from './About/TechSphere'

export function About() {
  const { state: gesture } = useHandGestures()
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scale = reducedMotion || gesture.status !== 'active' ? 1 : gesture.profileScale
  const attentionFocus = useAttentionFocused('section-about')

  return (
    <section
      id="section-about"
      className={`relative scroll-mt-20 py-20 md:py-28 transition-[box-shadow] duration-300 ${attentionFocus ? 'ring-2 ring-inset ring-accent/40' : ''}`}
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          <div
            className="order-2 md:order-1 flex justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <TechSphere className="!absolute inset-0 !w-full !h-full !max-w-none" />
              </div>
              <img
                src={site.aboutImage}
                alt="Venkat Vamsi"
                className="relative z-10 w-2/3 max-w-[220px] aspect-square rounded-full object-cover ring-2 ring-white/20 shadow-xl"
                width={220}
                height={220}
              />
            </div>
          </div>
          <div className="order-1 flex flex-col justify-center md:order-2">
            <h2 id="about-heading" className="font-display text-3xl font-bold text-white md:text-4xl">
              About <span className="text-accent">Me</span>
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-white/85">{about.body}</p>
            <p className="mt-8">
              <a
                href={site.cvUrl}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-accent/20 px-5 py-2.5 font-body text-sm font-medium text-accent transition hover:bg-accent/30"
              >
                <span>Download CV</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
