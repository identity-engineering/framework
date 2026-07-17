import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count: number;
}

export default function ParticleCloud({ count }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 4;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);

      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    return { positions, velocities, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = pos[ix];
      const y = pos[ix + 1];
      const z = pos[ix + 2];

      const dist = Math.sqrt(x * x + y * y + z * z);
      const pullStrength = 0.0003 / (dist * dist + 0.1);

      // Gravitational pull toward center
      pos[ix] += velocities[ix] - x * pullStrength;
      pos[ix + 1] += velocities[ix + 1] - y * pullStrength;
      pos[ix + 2] += velocities[ix + 2] - z * pullStrength;

      // Orbital rotation
      const angle = 0.002 / (dist + 0.5);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const newX = pos[ix] * cosA - pos[ix + 2] * sinA;
      const newZ = pos[ix] * sinA + pos[ix + 2] * cosA;
      pos[ix] = newX;
      pos[ix + 2] = newZ;

      // Reset if too close to center
      if (dist < 0.4) {
        const theta = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 3;
        pos[ix] = Math.cos(theta) * r;
        pos[ix + 1] = (Math.random() - 0.5) * 2;
        pos[ix + 2] = Math.sin(theta) * r;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.02;
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
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#e2e8f0"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
