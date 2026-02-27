/** Parallax offset in px from normalized -1..1 and intensity */
export function parallaxOffset(normalized: number, intensity: number): number {
  return normalized * intensity
}

/** CSS transform for 3D tilt from viewer state */
export function tiltTransform(x: number, y: number, maxDeg = 8): string {
  const rotY = x * maxDeg
  const rotX = -y * maxDeg
  return `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
}
