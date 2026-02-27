import { about, site } from '@/data/content'

export function About() {
  return (
    <section
      id="section-about"
      className="relative scroll-mt-20 py-20 md:py-28"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          <div className="order-2 md:order-1">
            <img
              src={site.aboutImage}
              alt="Venkat Vamsi"
              className="w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
              width={600}
              height={400}
            />
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
