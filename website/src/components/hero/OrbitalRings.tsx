import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = t * (0.02 + i * 0.008) * (i % 2 === 0 ? 1 : -1);
      child.rotation.x = Math.sin(t * 0.1 + i) * 0.05;
    });
  });

  const rings = [
    { radius: 1.8, tube: 0.008, tilt: [1.2, 0.3, 0], opacity: 0.25, color: '#a78bfa' },
    { radius: 2.4, tube: 0.006, tilt: [0.8, -0.2, 0.5], opacity: 0.18, color: '#06b6d4' },
    { radius: 3.0, tube: 0.005, tilt: [1.5, 0.6, -0.3], opacity: 0.12, color: '#a78bfa' },
    { radius: 3.6, tube: 0.004, tilt: [0.4, -0.5, 0.8], opacity: 0.08, color: '#ffffff' },
    { radius: 4.2, tube: 0.003, tilt: [1.0, 0.1, -0.6], opacity: 0.06, color: '#06b6d4' },
  ];

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.tilt as [number, number, number]}>
          <torusGeometry args={[ring.radius, ring.tube, 16, 200]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}
