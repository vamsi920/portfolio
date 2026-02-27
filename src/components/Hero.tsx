import { useEffect, useState } from 'react'
import { site } from '@/data/content'

const ROLES = site.roleWords
const TYPING_MS = 80
const PAUSE_MS = 2000
const DELETING_MS = 50

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    const word = ROLES[wordIndex]
    const delay = isDeleting ? DELETING_MS : subIndex === word.length ? PAUSE_MS : TYPING_MS

    const t = setTimeout(() => {
      if (isDeleting) {
        if (subIndex === 0) {
          setIsDeleting(false)
          setWordIndex((i) => (i + 1) % ROLES.length)
        } else {
          setSubIndex((s) => s - 1)
        }
      } else {
        if (subIndex === word.length) {
          setIsDeleting(true)
        } else {
          setSubIndex((s) => s + 1)
        }
      }
    }, delay)
    return () => clearTimeout(t)
  }, [wordIndex, subIndex, isDeleting])

  const displayText = ROLES[wordIndex].slice(0, subIndex)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <section
      id="section-home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-label="Home"
    >
      {/* Background layer — gradient + optional image */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-surface-muted/80 to-surface"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${site.heroImage})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" aria-hidden />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgb(255,255,255) 1px, transparent 1px), linear-gradient(90deg, rgb(255,255,255) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative z-10 px-6 text-center">
        <h1
          className={`font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
        >
          Hello, I'm <span className="text-accent">{site.name}</span>
        </h1>
        <div className="mt-4 min-h-[2.5rem] font-body text-xl text-white/90 md:text-2xl">
          {reducedMotion ? (
            <span>{ROLES[0]}</span>
          ) : (
            <span>
              {displayText}
              <span className="animate-pulse" aria-hidden>
                |
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden>
        <div className="h-10 w-6 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <span className="h-2 w-1 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
