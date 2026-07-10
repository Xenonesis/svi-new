'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';

function ArchitecturalForms() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: 0.8,
        roughness: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      }),
    []
  );

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh material={material} scale={2.5}>
          <boxGeometry args={[1, 2, 1]} />
        </mesh>
      </Float>
      <Float speed={1} rotationIntensity={0.8} floatIntensity={0.5}>
        <mesh material={material} position={[3, -1, -2]} scale={1.5}>
          <boxGeometry args={[1.5, 1, 1.5]} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh material={material} position={[-3, 1, -1]} scale={1.8}>
          <boxGeometry args={[1, 3, 1]} />
        </mesh>
      </Float>
    </group>
  );
}

function GridBackground() {
  return (
    <gridHelper
      args={[40, 40, '#ffffff', '#ffffff']}
      position={[0, -2.5, 0]}
      material-opacity={0.08}
      material-transparent
    />
  );
}

export default function HeroCanvas() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Respect vestibular disorder preference — skip the GPU-heavy canvas entirely
  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 mix-blend-screen">
      {/* dpr capped at [1, 2], antialias off, AdaptiveDpr reduces quality when FPS drops */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} gl={{ antialias: false }}>
        <AdaptiveDpr pixelated />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#d4af37" />

        <ArchitecturalForms />
        <GridBackground />

        <fog attach="fog" args={['#0b0c10', 5, 20]} />
      </Canvas>
    </div>
  );
}
