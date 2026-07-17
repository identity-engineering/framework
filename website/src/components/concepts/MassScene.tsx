import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function MassCore() {
  const groupRef = useRef<THREE.Group>(null);
  const shellsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }
    if (shellsRef.current) {
      shellsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const pulse = 1 + Math.sin(t * 0.5 + i * 0.8) * 0.03;
        mesh.scale.set(pulse, pulse, pulse);
        mesh.rotation.x = t * 0.02 * (i + 1);
        mesh.rotation.z = t * 0.015 * (i + 1);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dense core */}
      <mesh>
        <sphereGeometry args={[0.4, 64, 64]} />
        <meshStandardMaterial
          color="#1e1b4b"
          emissive="#7c3aed"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Density shells */}
      <group ref={shellsRef}>
        {[0.7, 1.1, 1.6, 2.2].map((r, i) => (
          <mesh key={i}>
            <sphereGeometry args={[r, 32, 32]} />
            <meshBasicMaterial
              color={i < 2 ? '#7c3aed' : '#a78bfa'}
              transparent
              opacity={0.06 - i * 0.012}
              wireframe
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Gravitational field lines */}
      <FieldLines />
    </group>
  );
}

function FieldLines() {
  const ref = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: THREE.Vector3[][] = [];
    for (let i = 0; i < 24; i++) {
      const points: THREE.Vector3[] = [];
      const theta = (i / 24) * Math.PI * 2;
      for (let j = 0; j < 30; j++) {
        const t = j / 30;
        const r = 0.5 + t * 3;
        const spiral = theta + t * 0.5;
        points.push(new THREE.Vector3(
          Math.cos(spiral) * r,
          (Math.random() - 0.5) * 0.3 * t,
          Math.sin(spiral) * r
        ));
      }
      result.push(points);
    }
    return result;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <group ref={ref}>
      {lines.map((pts, i) => {
        const curve = new THREE.CatmullRomCurve3(pts);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color="#a78bfa" transparent opacity={0.12} />
          </line>
        );
      })}
    </group>
  );
}

export default function MassScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#a78bfa" />
        <pointLight position={[-2, -1, 2]} intensity={0.5} color="#06b6d4" />
        <MassCore />
        <fog attach="fog" args={['#0a0a0f', 5, 14]} />
      </Canvas>
    </div>
  );
}
