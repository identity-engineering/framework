import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function SpaceGrid() {
  const ref = useRef<THREE.Group>(null);

  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const size = 8;
    const divisions = 20;
    const step = size / divisions;

    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const rowX: THREE.Vector3[] = [];
      const rowZ: THREE.Vector3[] = [];

      for (let j = -divisions / 2; j <= divisions / 2; j++) {
        const x = i * step;
        const z = j * step;
        const dist = Math.sqrt(x * x + z * z);
        const warp = -2.5 / (dist + 1.2);

        rowX.push(new THREE.Vector3(x, warp, z));
        rowZ.push(new THREE.Vector3(j * step, -2.5 / (Math.sqrt(j * step * j * step + i * step * i * step) + 1.2), i * step));
      }

      lines.push(rowX);
      lines.push(rowZ);
    }

    return lines;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      {gridLines.map((pts, i) => {
        const curve = new THREE.CatmullRomCurve3(pts);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={i % 4 < 2 ? '#06b6d4' : '#a78bfa'}
              transparent
              opacity={0.2}
            />
          </line>
        );
      })}

      {/* The mass causing curvature */}
      <mesh position={[0, -1.8, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#06b6d4"
          emissiveIntensity={2}
          roughness={0}
          metalness={1}
        />
      </mesh>

      {/* Glow */}
      <mesh position={[0, -1.8, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function FallingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = pos[ix];
      const z = pos[ix + 2];
      const dist = Math.sqrt(x * x + z * z);
      const pull = 0.003 / (dist + 0.5);

      pos[ix] -= x * pull;
      pos[ix + 1] -= 0.008 / (dist + 0.3);
      pos[ix + 2] -= z * pull;

      if (pos[ix + 1] < -3 || dist < 0.3) {
        pos[ix] = (Math.random() - 0.5) * 8;
        pos[ix + 1] = 3 + Math.random() * 2;
        pos[ix + 2] = (Math.random() - 0.5) * 8;
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#67e8f9"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function CurvatureScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [4, 3, 4], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.08} />
        <pointLight position={[0, -1.5, 0]} intensity={2} color="#06b6d4" />
        <SpaceGrid />
        <FallingParticles />
        <fog attach="fog" args={['#0a0a0f', 6, 16]} />
      </Canvas>
    </div>
  );
}
