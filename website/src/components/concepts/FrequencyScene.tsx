// @ts-nocheck
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

type ProgressRef = Readonly<{ progress: React.RefObject<number> }>;

/**
 * Frequency — filigree, scroll-scrubbed identity frequency field.
 * Visual logic:
 * - A coherent identity core in the center.
 * - Multiple thin spectral shells that deform with scroll progress.
 * - Fine filaments and particles expressing multidimensional tension distortion.
 */
export default function FrequencyScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [0, 1.9, 6.2], fov: 47 }} fogFar={16}>
        <ScrollProgressController progress={progress} />
        <IdentityCore progress={progress} />
        <FrequencyShells progress={progress} />
        <SpectralFilaments progress={progress} />
        <TensionParticles progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function IdentityCore({ progress }: ProgressRef) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const stemRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const p = progress.current;
    const lock = smoothstep(0.18, 0.82, p);
    const t = state.clock.elapsedTime;
    const micro = 0.008 + lock * 0.01;

    if (coreRef.current) {
      coreRef.current.rotation.y = p * Math.PI * 0.85;
      coreRef.current.rotation.x = Math.sin(t * 2.6) * micro;
      coreRef.current.rotation.z = Math.cos(t * 2.1) * micro * 0.9;
      coreRef.current.position.y = Math.sin(t * 3.1) * micro * 1.2;
      const s = 0.9 + lock * 0.24;
      coreRef.current.scale.setScalar(s);
    }

    if (stemRef.current) {
      stemRef.current.scale.y = 0.8 + lock * 0.5;
      stemRef.current.position.y = -0.05 + lock * 0.08;
    }

    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 0.45 + lock * 1.35;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.21, 0]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={mono.core}
          emissive={mono.white}
          emissiveIntensity={0.8}
          roughness={0.02}
          metalness={1}
          wireframe
        />
      </mesh>

      <mesh ref={stemRef} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.72, 12]} />
        <meshBasicMaterial color={mono.high} transparent opacity={0.32} depthWrite={false} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.006, 8, 96]} />
        <meshBasicMaterial color={mono.high} transparent opacity={0.24} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FrequencyShells({ progress }: ProgressRef) {
  const groupRef = useRef<THREE.Group>(null);

  const shells = useMemo(() => {
    const shellData: { radius: number; depth: number; phase: number }[] = [];
    for (let i = 0; i < 7; i++) {
      shellData.push({
        radius: 0.62 + i * 0.36,
        depth: 0.35 + i * 0.13,
        phase: i * 0.49,
      });
    }
    return shellData;
  }, []);

  const baseAngles = useMemo(() => {
    const arr: number[] = [];
    for (let a = 0; a < 360; a += 6) arr.push((a * Math.PI) / 180);
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.current;
    const lock = smoothstep(0.18, 0.84, p);

    groupRef.current.rotation.y = p * Math.PI * 0.75;
    groupRef.current.rotation.x = (p - 0.5) * 0.18;

    groupRef.current.children.forEach((child, i) => {
      const shell = shells[i];
      if (!shell) return;

      const line = child as THREE.LineLoop;
      const geometry = line.geometry;
      const pos = geometry.attributes.position as THREE.BufferAttribute;

      const amp = (0.03 + lock * 0.22) * shell.depth;
      const phaseA = p * Math.PI * (2.6 + shell.depth * 1.2) + shell.phase;
      const phaseB = p * Math.PI * (4.2 + shell.depth * 0.8) - shell.phase * 0.7;

      for (let j = 0; j < baseAngles.length; j++) {
        const t = baseAngles[j];

        const localR =
          shell.radius +
          Math.sin(t * (3.1 + shell.depth) + phaseA) * amp +
          Math.sin(t * (5.2 + shell.depth * 0.6) - phaseB) * amp * 0.5;

        const x = Math.cos(t) * localR;
        const z = Math.sin(t) * localR;
        const y =
          Math.sin(t * (2.4 + shell.depth * 0.5) + phaseB) * amp * 0.75 +
          Math.cos(t * 4.0 - phaseA) * amp * 0.35;

        pos.setXYZ(j, x, y, z);
      }

      pos.needsUpdate = true;
      geometry.computeBoundingSphere();

      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.07 + lock * 0.2 + (i / shells.length) * 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      {shells.map((shell, i) => {
        const points = baseAngles.map((t) => new THREE.Vector3(Math.cos(t) * shell.radius, 0, Math.sin(t) * shell.radius));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <lineLoop key={`shell-${i}-${shell.radius.toFixed(2)}`} geometry={geometry}>
            <lineBasicMaterial
              color={i % 2 === 0 ? mono.high : mono.mid}
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </lineLoop>
        );
      })}
    </group>
  );
}

function SpectralFilaments({ progress }: ProgressRef) {
  const groupRef = useRef<THREE.Group>(null);

  const filaments = useMemo(() => {
    const arr: { angle: number; spread: number; phase: number; length: number }[] = [];
    for (let i = 0; i < 22; i++) {
      arr.push({
        angle: (i / 22) * Math.PI * 2,
        spread: 0.08 + (i % 4) * 0.03,
        phase: i * 0.37,
        length: 1.4 + (i % 5) * 0.34,
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.current;
    const lock = smoothstep(0.2, 0.86, p);

    groupRef.current.rotation.y = p * Math.PI * 0.62;

    groupRef.current.children.forEach((child, i) => {
      const f = filaments[i];
      if (!f) return;

      const line = child as THREE.Line;
      const geometry = line.geometry;
      const pos = geometry.attributes.position as THREE.BufferAttribute;

      for (let k = 0; k < 14; k++) {
        const t = k / 13;
        const bend = Math.sin(t * Math.PI * (1.6 + f.spread * 8) + p * Math.PI * 2.5 + f.phase) * (0.08 + lock * 0.2);
        const radial = f.length * t;

        const x = Math.cos(f.angle) * radial + Math.cos(f.angle + Math.PI / 2) * bend;
        const z = Math.sin(f.angle) * radial + Math.sin(f.angle + Math.PI / 2) * bend;
        const y = (t - 0.5) * f.spread * (0.9 + lock * 1.2);

        pos.setXYZ(k, x, y, z);
      }

      pos.needsUpdate = true;
      geometry.computeBoundingSphere();

      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.05 + lock * 0.16;
    });
  });

  return (
    <group ref={groupRef}>
      {filaments.map((f, i) => {
        const points = Array.from({ length: 14 }, (_, k) => {
          const t = k / 13;
          return new THREE.Vector3(Math.cos(f.angle) * f.length * t, 0, Math.sin(f.angle) * f.length * t);
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`filament-${i}-${f.phase.toFixed(2)}`} geometry={geometry}>
            <lineBasicMaterial color={mono.mid} transparent opacity={0.12} depthWrite={false} />
          </line>
        );
      })}
    </group>
  );
}

function TensionParticles({ progress }: ProgressRef) {
  const ref = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const count = 220;
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.75 + Math.random() * 2.7;
      const y = (Math.random() - 0.5) * 1.9;

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      ph[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, phases: ph };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const lock = smoothstep(0.18, 0.88, p);

    const geo = ref.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x0 = positions[i * 3];
      const y0 = positions[i * 3 + 1];
      const z0 = positions[i * 3 + 2];
      const phase = phases[i];

      const sway = Math.sin(phase + p * Math.PI * 3.1 + i * 0.03) * (0.03 + lock * 0.09);
      const pull = 1 + Math.sin(phase + p * Math.PI * 1.2) * (0.02 + lock * 0.06);

      pos.setXYZ(i, x0 * pull + sway, y0 + sway * 0.7, z0 * pull - sway * 0.6);
    }

    pos.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.12 + lock * 0.24;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={mono.high}
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </points>
  );
}
