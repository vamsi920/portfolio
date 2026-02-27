import { contact } from '@/data/content'

export function Contact() {
  return (
    <section
      id="section-contact"
      className="relative scroll-mt-20 py-20 md:py-28"
      aria-labelledby="contact-heading"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <h2 id="contact-heading" className="font-display text-center text-3xl font-bold text-white md:text-4xl">
          Get <span className="text-accent">In Touch</span>
        </h2>
        <div className="mx-auto mt-14 grid gap-12 md:grid-cols-2">
          <div className="glass rounded-2xl p-8">
            <p className="mb-6 font-body text-white/70">{contact.formNote}</p>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 rounded-xl bg-accent/20 px-5 py-2.5 font-body text-accent transition hover:bg-accent/30"
            >
              Email me
            </a>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">Contact details</h3>
            <ul className="mt-4 space-y-3 font-body text-white/85">
              <li>
                <span className="text-white/60">Email</span>{' '}
                <a href={`mailto:${contact.email}`} className="text-accent hover:underline">
                  {contact.email}
                </a>
              </li>
              <li>
                <span className="text-white/60">Phone</span> {contact.phone}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
