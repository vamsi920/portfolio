import { useRef, useState, useCallback, useEffect } from 'react'
import { projects } from '@/data/content'
import type { ProjectItem } from '@/data/content'

const CARD_WIDTH = 300
const GAP = 24
const SNAP_MS = 300
const DEPTH_SCALE_RANGE = 0.35
const TRAIL_MAX_WIDTH = 80

function ProjectGalleryCard({ item, style }: { item: ProjectItem; style: React.CSSProperties }) {
  return (
    <article
      className="gallery-card flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-[transform,opacity] duration-200 will-change-transform"
      style={{
        width: CARD_WIDTH,
        ...style,
      }}
    >
      <h3 className="font-display text-lg font-semibold text-white">{item.name}</h3>
      <p className="mt-2 line-clamp-3 font-body text-sm text-white/80">{item.description}</p>
      {item.links && item.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

/**
 * Gesture-driven project gallery: pseudo-4D (time axis + depth + motion trails).
 * Drag to scroll; depth/scale by position; single CSS-based motion trail for performance.
 */
export function ProjectGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [trail, setTrail] = useState<{ left: number; width: number } | null>(null)
  const [containerWidth, setContainerWidth] = useState(400)
  const startXRef = useRef(0)
  const startScrollRef = useRef(0)
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const stripWidth = projects.length * (CARD_WIDTH + GAP) - GAP

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.offsetWidth)
    })
    ro.observe(el)
    setContainerWidth(el.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (reducedMotion) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      startXRef.current = e.clientX
      startScrollRef.current = scrollOffset
      setIsDragging(true)
      setTrail({ left: e.clientX - rect.left, width: 0 })
    },
    [scrollOffset, reducedMotion]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || reducedMotion) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const delta = e.clientX - startXRef.current
      const next = Math.max(0, Math.min(stripWidth - containerWidth, startScrollRef.current - delta))
      setScrollOffset(next)
      const trailWidth = Math.min(TRAIL_MAX_WIDTH, Math.abs(delta))
      const localX = e.clientX - rect.left
      setTrail({
        left: delta > 0 ? localX - trailWidth : localX,
        width: trailWidth,
      })
    },
    [isDragging, stripWidth, containerWidth, reducedMotion]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    setTrail(null)
    const index = Math.round(scrollOffset / (CARD_WIDTH + GAP))
    const snapTo = index * (CARD_WIDTH + GAP)
    setScrollOffset(Math.max(0, Math.min(stripWidth - containerWidth, snapTo)))
  }, [isDragging, scrollOffset, stripWidth, containerWidth])

  useEffect(() => {
    if (!isDragging) return
    const onUp = () => handlePointerUp()
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointerleave', onUp)
    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointerleave', onUp)
    }
  }, [isDragging, handlePointerUp])

  return (
    <div className="project-gallery">
      {/* Time axis: dots */}
      <div
        className="mb-3 flex justify-center gap-2"
        role="tablist"
        aria-label="Project timeline"
      >
        {projects.map((_, i) => {
          const pos = i * (CARD_WIDTH + GAP)
          const center = scrollOffset + containerWidth / 2
          const dist = Math.abs(pos + CARD_WIDTH / 2 + GAP / 2 - center)
          const active = dist < CARD_WIDTH
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Project ${i + 1}`}
              className="h-2 w-2 rounded-full border-0 transition-colors duration-200"
              style={{
                background: active ? 'rgb(132, 144, 255)' : 'rgb(255 255 255 / 0.25)',
              }}
              onClick={() => {
                if (reducedMotion) return
                setScrollOffset(Math.max(0, Math.min(stripWidth - containerWidth, i * (CARD_WIDTH + GAP))))
              }}
            />
          )
        })}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl"
        style={{ perspective: '1200px', touchAction: 'pan-y pinch-zoom' }}
      >
        {/* Motion trail (single layer, CSS-only) */}
        {trail && (
          <div
            className="pointer-events-none absolute inset-y-0 z-20 opacity-40 transition-opacity duration-300"
            style={{
              left: trail.left,
              width: trail.width,
              background: 'linear-gradient(90deg, transparent, rgba(132,144,255,0.35), transparent)',
              filter: 'blur(8px)',
            }}
            aria-hidden
          />
        )}

        <div
          className="flex gap-6 py-4"
          style={{
            width: stripWidth,
            transform: `translate3d(${-scrollOffset}px, 0, 0)`,
            transition: isDragging ? 'none' : `transform ${SNAP_MS}ms ease-out`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {projects.map((item, i) => {
            const cardCenter = i * (CARD_WIDTH + GAP) + CARD_WIDTH / 2 + GAP / 2
            const viewportCenter = scrollOffset + containerWidth / 2
            const distance = (cardCenter - viewportCenter) / containerWidth
            const depth = Math.max(-1, Math.min(1, distance))
            const scale = 1 - Math.abs(depth) * DEPTH_SCALE_RANGE
            const opacity = 0.6 + (1 - Math.abs(depth)) * 0.4
            const zIndex = Math.round(100 - Math.abs(depth) * 50)

            return (
              <ProjectGalleryCard
                key={item.name}
                item={item}
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              />
            )
          })}
        </div>
      </div>

      <p className="mt-2 text-center font-body text-xs text-white/50">
        Drag to move · Time axis above
      </p>
    </div>
  )
}
