'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, TorusKnot, Octahedron } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const count = 4000
  const pointsRef = useRef<THREE.Points>(null)

  // Generate particles
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const colorViolet = new THREE.Color('#7c3aed')
    const colorCyan = new THREE.Color('#06b6d4')
    const tempColor = new THREE.Color()

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40

      // Gradient based on Y
      const yRatio = (pos[i * 3 + 1] + 20) / 40
      tempColor.lerpColors(colorViolet, colorCyan, yRatio)
      
      col[i * 3] = tempColor.r
      col[i * 3 + 1] = tempColor.g
      col[i * 3 + 2] = tempColor.b
    }
    return [pos, col]
  }, [count])

  // Initial offsets for sine wave logic
  const offsets = useMemo(() => {
    const off = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      off[i] = Math.random() * Math.PI * 2
    }
    return off
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.elapsedTime
    const positionsAttr = pointsRef.current.geometry.attributes.position

    for (let i = 0; i < count; i++) {
      // Drift on a sine wave path
      const yBase = positions[i * 3 + 1]
      const offset = offsets[i]
      positionsAttr.array[i * 3 + 1] = yBase + Math.sin(time * 0.5 + offset) * 0.5

      // Mouse parallax
      positionsAttr.array[i * 3] = positions[i * 3] - (state.pointer.x * 2)
      positionsAttr.array[i * 3 + 2] = positions[i * 3 + 2] - (state.pointer.y * 2)
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function FloatingGeometry() {
  const icosahedronRef = useRef<THREE.Mesh>(null)
  const torusRef = useRef<THREE.Mesh>(null)
  const octahedronRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (icosahedronRef.current) {
       icosahedronRef.current.rotation.y += 0.003
       icosahedronRef.current.rotation.x += 0.002
    }
    if (torusRef.current) {
       torusRef.current.rotation.y -= 0.005
       torusRef.current.rotation.z -= 0.004
    }
    if (octahedronRef.current) {
       octahedronRef.current.position.y = Math.sin(time) * 0.5
       octahedronRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={[0, 0, -2]}>
      <Icosahedron ref={icosahedronRef} args={[1.2, 0]} position={[-2, 0, 0]}>
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.8} />
      </Icosahedron>

      <TorusKnot ref={torusRef} args={[0.6, 0.2, 100, 16]} position={[2, 1, -1]}>
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.8} />
      </TorusKnot>

      <Octahedron ref={octahedronRef} args={[0.8, 0]} position={[0, -1.5, 1]}>
        <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.8} />
      </Octahedron>
    </group>
  )
}

function PerspectiveGridFloor() {
  const gridRef = useRef<THREE.Mesh>(null)

  // Custom shader for grid pulsing lines
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#7c3aed') }
    },
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        float lineHz = 50.0;
        float lineVt = 50.0;
        
        // Animate grid lines moving towards camera
        float moveY = vUv.y - (time * 0.1);
        
        float gridY = abs(fract(moveY * lineVt - 0.5) - 0.5) / fwidth(moveY * lineVt);
        float gridX = abs(fract(vUv.x * lineHz - 0.5) - 0.5) / fwidth(vUv.x * lineHz);
        
        float line = min(gridY, gridX);
        float alpha = 1.0 - min(line, 1.0);
        
        // Fog effect at edges (fade out towards edges and back)
        float distEdge = distance(vUv, vec2(0.5, 0.5)) * 2.0;
        alpha *= (1.0 - smoothstep(0.4, 1.0, distEdge));
        
        gl_FragColor = vec4(color, alpha * 0.5);
      }
    `
  }), [])

  useFrame((state) => {
    if (material) {
      material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={gridRef} position={[0, -3, 0]} rotation={[-Math.PI / 2 + 0.2, 0, 0]} material={material}>
      <planeGeometry args={[50, 50, 50, 50]} />
    </mesh>
  )
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      {/* Black bg specifically for the canvas layer to ensure high contrast */}
      <color attach="background" args={['#03030a']} />
      <fog attach="fog" args={['#03030a', 5, 25]} />
      
      <ParticleField />
      <FloatingGeometry />
      <PerspectiveGridFloor />
    </Canvas>
  )
}
