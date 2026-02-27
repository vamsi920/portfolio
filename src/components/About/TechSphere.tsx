import { useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { skillNodes } from '@/data/skillNodes'

/** Distribute N points on a sphere (Fibonacci-like) */
function spherePoints(n: number): [number, number, number][] {
  const pts: [number, number, number][] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r])
  }
  return pts
}

const RADIUS = 2.2
const NODE_BASE_SCALE = 0.12
const SNAP_SCALE = 1.8
const SNAP_PUSH = 0.35
const LERP = 0.12
const ROTATE_SPEED = 0.15

interface NodeProps {
  node: { id: string; label: string }
  basePos: [number, number, number]
}

function SkillNodeMesh({ node, basePos }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const scaleRef = useRef(1)
  const pushRef = useRef(0)

  const pos = useMemo(() => {
    const [x, y, z] = basePos
    return new THREE.Vector3(x * RADIUS, y * RADIUS, z * RADIUS)
  }, [basePos])

  useFrame(() => {
    if (!meshRef.current) return
    const targetScale = hovered ? SNAP_SCALE : 1
    const targetPush = hovered ? SNAP_PUSH : 0
    scaleRef.current += (targetScale - scaleRef.current) * LERP
    pushRef.current += (targetPush - pushRef.current) * LERP
    const s = NODE_BASE_SCALE * scaleRef.current
    meshRef.current.scale.setScalar(s)
    const normal = pos.clone().normalize()
    meshRef.current.position.copy(pos).add(normal.multiplyScalar(pushRef.current))
  })

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
  }
  const handlePointerOut = () => setHovered(false)

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={hovered ? '#8490ff' : '#5a67a3'}
        emissive={hovered ? '#8490ff' : '#2a2a3a'}
        emissiveIntensity={hovered ? 0.4 : 0.1}
        metalness={0.3}
        roughness={0.6}
      />
      {hovered && (
        <Html
          center
          distanceFactor={4}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '12px',
            color: '#e2e8f0',
            background: 'rgba(18,18,24,0.85)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {node.label}
        </Html>
      )}
    </mesh>
  )
}

function SphereGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const points = useMemo(() => spherePoints(skillNodes.length), [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATE_SPEED * delta
    }
  })

  return (
    <group ref={groupRef}>
      {skillNodes.map((node, i) => (
        <SkillNodeMesh key={node.id} node={node} basePos={points[i]} />
      ))}
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.2} />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="#8490ff" />
      <SphereGroup />
    </>
  )
}

interface TechSphereProps {
  className?: string
}

export function TechSphere({ className = '' }: TechSphereProps) {
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    return null
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 280,
        position: 'relative',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', borderRadius: '1rem' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
