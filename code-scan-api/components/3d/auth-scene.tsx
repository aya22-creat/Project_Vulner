'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function AuthMeshes() {
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const count = 1000
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
       // Sphere arrangement
       const r = 4 + Math.random() * 2
       const theta = Math.random() * Math.PI * 2
       const phi = Math.acos(Math.random() * 2 - 1)
       pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
       pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
       pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return [pos]
  }, [])

  useFrame((state, delta) => {
    if (innerRef.current) {
      innerRef.current.rotation.x += delta * 0.2
      innerRef.current.rotation.y += delta * 0.3
    }
    if (outerRef.current) {
      outerRef.current.rotation.x -= delta * 0.1
      outerRef.current.rotation.y -= delta * 0.15
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group>
      {/* Inner Shield */}
      <Icosahedron ref={innerRef} args={[2.5, 1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#7c3aed" wireframe={true} />
      </Icosahedron>

      {/* Outer Shell */}
      <Icosahedron ref={outerRef} args={[2.8, 2]} position={[0, 0, 0]}>
        <meshPhongMaterial color="#06b6d4" emissive="#06b6d4" transparent opacity={0.15} wireframe={true} />
      </Icosahedron>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#06b6d4" transparent opacity={0.6} />
      </points>
    </group>
  )
}

export function AuthScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <color attach="background" args={['#03030a']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#06b6d4" />
      <AuthMeshes />
      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={2.0} />
      </EffectComposer>
    </Canvas>
  )
}
