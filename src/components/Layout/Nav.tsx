import { useState } from 'react'
import { useSoundFeedback } from '@/context/SoundFeedbackContext'

const links = [
  { href: '#section-home', label: 'Home' },
  { href: '#section-about', label: 'About' },
  { href: '#section-resume', label: 'Resume' },
  { href: '#section-services', label: 'What I Know' },
  { href: '#section-contact', label: 'Contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const { playFeedback } = useSoundFeedback()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      role="navigation"
      aria-label="Main"
    >
      <div className="glass-strong mx-4 mt-4 rounded-2xl md:mx-8">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <a
            href="#section-home"
            className="font-display text-lg font-semibold text-white"
            onClick={(e) => playFeedback('click', e.clientX / window.innerWidth)}
          >
            VV
          </a>
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">Toggle menu</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <ul
            id="nav-menu"
            className={`font-body absolute left-4 right-4 top-full mt-2 flex flex-col gap-1 rounded-xl glass p-3 md:static md:mt-0 md:flex-row md:gap-0 md:rounded-none md:bg-transparent md:p-0 ${open ? 'block' : 'hidden md:flex'}`}
          >
            {links.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="block rounded-lg px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white md:px-3"
                  onClick={(e) => {
                    playFeedback('click', e.clientX / window.innerWidth)
                    setOpen(false)
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
