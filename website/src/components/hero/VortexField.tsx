import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function VortexField() {
  const linesRef = useRef<THREE.Group>(null);

  const curves = useMemo(() => {
    const result: THREE.CatmullRomCurve3[] = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const points: THREE.Vector3[] = [];
      const radius = 1.2 + Math.random() * 3.5;
      const segments = 80;
      const spiralSpeed = 0.8 + Math.random() * 1.5;
      const heightRange = 3 + Math.random() * 2;
      const phaseOffset = (i / count) * Math.PI * 2;

      for (let j = 0; j < segments; j++) {
        const t = j / segments;
        const angle = phaseOffset + t * Math.PI * 2 * spiralSpeed;
        const r = radius * (1 - t * 0.7);
        const y = (t - 0.5) * heightRange * (1 - t);

        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          y,
          Math.sin(angle) * r
        ));
      }

      result.push(new THREE.CatmullRomCurve3(points));
    }

    return result;
  }, []);

  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={linesRef}>
      {curves.map((curve, i) => {
        const points = curve.getPoints(80);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const opacity = 0.08 + (i % 5) * 0.03;

        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? '#06b6d4' : '#ffffff'}
              transparent
              opacity={opacity}
            />
          </line>
        );
      })}
    </group>
  );
}
