import { useRef, useEffect, useCallback } from 'react'
import { useViewer } from '@/context/ViewerContext'
import { useHandGestures } from '@/context/HandGestureContext'
import { useAmazeMode } from '@/context/AmazeModeContext'
import { AMAZE_PARTICLE_BUDGET } from '@/context/AmazeModeContext'

const PARTICLE_COUNT = 55
const CURSOR_RADIUS = 120
const CURSOR_STRENGTH = 0.018
const SCROLL_INFLUENCE = 0.12
const HAND_WIND_STRENGTH = 0.6
const DAMPING = 0.96
const DRIFT = 0.15

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  baseX: number
  baseY: number
}

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Ambient particle field: responds to cursor, scroll velocity, and hand movement.
 * Reduced-motion safe: static faint dots, no animation loop.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const scrollVelRef = useRef(0)
  const lastScrollRef = useRef(0)
  const lastScrollTRef = useRef(0)
  const cursorRef = useRef({ x: 0, y: 0 })
  const handRef = useRef({ status: 'idle' as string, timelineRotation: 0 })
  const { state: viewer } = useViewer()
  const { state: gesture } = useHandGestures()
  const { performanceBudget } = useAmazeMode()
  const particleCount = performanceBudget ? AMAZE_PARTICLE_BUDGET : PARTICLE_COUNT

  cursorRef.current = { x: viewer.x, y: viewer.y }
  handRef.current = { status: gesture.status, timelineRotation: gesture.timelineRotation }

  const initParticles = useCallback((width: number, height: number, count: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
      })
    }
    return particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = getReducedMotion()
    let width = window.innerWidth
    let height = window.innerHeight
    let particles = particlesRef.current

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      if (particles.length !== particleCount) {
        particles = initParticles(width, height, particleCount)
        particlesRef.current = particles
      } else {
        particles.forEach((p) => {
          p.x = Math.min(p.x, width)
          p.y = Math.min(p.y, height)
          p.baseX = Math.min(p.baseX, width)
          p.baseY = Math.min(p.baseY, height)
        })
      }
    }

    const handleScroll = () => {
      const now = performance.now()
      const scrollY = window.scrollY ?? document.documentElement.scrollTop
      const dt = (now - lastScrollTRef.current) / 1000
      if (dt > 0 && dt < 0.2) {
        scrollVelRef.current = (scrollY - lastScrollRef.current) / dt
      }
      lastScrollRef.current = scrollY
      lastScrollTRef.current = now
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    if (reducedMotion) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        particles = initParticles(width, height, particleCount)
        particlesRef.current = particles
        particles.forEach((p) => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        })
      }
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('scroll', handleScroll)
      }
    }

    let rafId = 0
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (particles.length !== particleCount) {
      particles = initParticles(width, height, particleCount)
      particlesRef.current = particles
    }

    const run = () => {
      rafId = requestAnimationFrame(run)
      const { x: cx, y: cy } = cursorRef.current
      const cursorX = (cx + 1) * 0.5 * width
      const cursorY = (cy + 1) * 0.5 * height
      const hand = handRef.current
      const handWind = hand.status === 'active' ? hand.timelineRotation * HAND_WIND_STRENGTH : 0
      const scrollNudge = Math.max(-80, Math.min(80, scrollVelRef.current * SCROLL_INFLUENCE))
      scrollVelRef.current *= 0.92

      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        const dx = p.x - cursorX
        const dy = p.y - cursorY
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
        if (dist < CURSOR_RADIUS) {
          const force = (1 - dist / CURSOR_RADIUS) * CURSOR_STRENGTH
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
        p.vy += scrollNudge * 0.008
        p.vx += handWind * 0.02
        p.vx += (Math.random() - 0.5) * DRIFT
        p.vy += (Math.random() - 0.5) * DRIFT
        p.vx *= DAMPING
        p.vy *= DAMPING
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) {
          p.x = Math.max(0, Math.min(width, p.x))
          p.vx *= -0.3
        }
        if (p.y < 0 || p.y > height) {
          p.y = Math.max(0, Math.min(height, p.y))
          p.vy *= -0.3
        }
        const alpha = 0.15 + 0.1 * (1 - dist / (CURSOR_RADIUS * 2))
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.35, alpha)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    run()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [initParticles, particleCount])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ display: 'block' }}
      aria-hidden
    />
  )
}
