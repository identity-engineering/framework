import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gaussianEnvelope } from './gaussian';

interface Props {
  count: number;
}

/**
 * Particles orbiting the Identity Stem.
 * Radial distribution follows a Gaussian bell centered on the present (y=0):
 * dense/wide at the mass core, tapering toward past and future poles.
 */
export default function StemParticles({ count }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases, baseRadii, baseY } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const baseRadii = new Float32Array(count);
    const baseY = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Slightly denser sampling near present (importance sample along y)
      const u = (i * 0.6180339887) % 1;
      // Mix uniform + center-biased: keeps poles visible but fills the bell
      const yUniform = -2.3 + u * 4.6;
      const yCenter = (u - 0.5) * 3.2; // tighter around 0
      const y = yUniform * 0.45 + yCenter * 0.55;

      const envelope = gaussianEnvelope(y, 1.05, 0.1);
      // Random fill inside the Gaussian radius (not only shell)
      const fill = 0.25 + ((i * 0.3819660113) % 1) * 0.75;
      const rMax = 2.15 * envelope;
      const r = rMax * fill;

      const theta = (i / count) * Math.PI * 2 * 7.3;

      baseRadii[i] = r;
      phases[i] = theta;
      baseY[i] = y;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
    }

    return { positions, phases, baseRadii, baseY };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const r = baseRadii[i];
      // Angular speed higher near the axis
      const speed = 0.14 / (0.35 + r * 0.55);
      const angle = phases[i] + t * speed;

      pos[ix] = Math.cos(angle) * r;
      pos[ix + 1] = baseY[i] + Math.sin(t * 0.25 + phases[i]) * 0.03;
      pos[ix + 2] = Math.sin(angle) * r;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#e4e4e7"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
