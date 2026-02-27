import { useEffect, useState } from 'react'
import { useEyeTracking } from '@/context/EyeTrackingContext'
import { useAttentionFocused } from '@/context/AttentionModeContext'
import { site } from '@/data/content'

const ROLES = site.roleWords
const TYPING_MS = 80
const PAUSE_MS = 2000
const DELETING_MS = 50

/** Parallax intensity for hero layers (px per normalized unit) */
const PARALLAX_DEPTH = 24

export function HeroParallax() {
  const { state: eyeState } = useEyeTracking()
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
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const dx = reducedMotion ? 0 : eyeState.x * PARALLAX_DEPTH
  const dy = reducedMotion ? 0 : eyeState.y * PARALLAX_DEPTH
  const attentionFocus = useAttentionFocused('section-home')

  return (
    <section
      id="section-home"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden transition-[box-shadow] duration-300 ${attentionFocus ? 'ring-2 ring-inset ring-accent/40' : ''}`}
      aria-label="Home"
    >
      {/* Depth layers with parallax offset */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-surface-muted/80 to-surface"
        aria-hidden
        style={{ transform: `translate(${dx * 0.3}px, ${dy * 0.3}px)` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url(${site.heroImage})`,
          transform: `translate(${dx * 0.6}px, ${dy * 0.6}px)`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgb(255,255,255) 1px, transparent 1px), linear-gradient(90deg, rgb(255,255,255) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          transform: `translate(${dx}px, ${dy}px)`,
        }}
        aria-hidden
      />

      <div
        className="relative z-10 px-6 text-center transition-transform duration-150 ease-out"
        style={{ transform: `translate(${dx * 0.2}px, ${dy * 0.2}px)` }}
      >
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

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden
        style={{ transform: `translate(calc(-50% + ${dx}px), ${dy}px)` }}
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-2">
          <span className="h-2 w-1 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
