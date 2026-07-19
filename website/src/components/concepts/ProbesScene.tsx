import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Questions as Probes — measurement state scrubbed by scroll only.
 */
export default function ProbesScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [0, 1.5, 5], fov: 48 }}>
        <ScrollProgressController progress={progress} />
        <CenterProbe progress={progress} />
        <ScanBeams progress={progress} />
        <DataNodes progress={progress} />
        <ConnectionWeb progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function ScanBeams({ progress }: { progress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  const beams = useMemo(() => {
    const arr: { angle: number; length: number; phase: number }[] = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        angle: (i / 8) * Math.PI * 2,
        length: 3 + (i % 3) * 0.5,
        phase: i / 8,
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.current;
    const active = smoothstep(0.08, 0.45, p);

    groupRef.current.children.forEach((child, i) => {
      const beam = beams[i];
      if (!beam) return;
      // Wave of activation around the ring as scroll advances
      const local = (p * 2.5 + beam.phase) % 1;
      const pulse = local < 0.5 ? local * 2 : (1 - local) * 2;
      const mat = materialsRef.current[i];
      if (mat) mat.opacity = pulse * 0.32 * active;
      child.scale.y = 0.35 + pulse * 1.5 * active;
    });
  });

  return (
    <group ref={groupRef}>
      {beams.map((beam, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(beam.angle) * beam.length * 0.5,
            0,
            Math.sin(beam.angle) * beam.length * 0.5,
          ]}
          rotation={[0, 0, -beam.angle + Math.PI / 2]}
        >
          <boxGeometry args={[0.012, beam.length, 0.012]} />
          <meshBasicMaterial
            ref={(mat) => {
              if (mat) materialsRef.current[i] = mat;
            }}
            color={mono.high}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function DataNodes({ progress }: { progress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const arr: { pos: [number, number, number]; size: number; phase: number }[] =
      [];
    for (let i = 0; i < 18; i++) {
      const theta = (i / 18) * Math.PI * 2 + (i % 3) * 0.2;
      const r = 1.1 + (i % 5) * 0.45;
      arr.push({
        pos: [
          Math.cos(theta) * r,
          ((i % 7) - 3) * 0.28,
          Math.sin(theta) * r,
        ],
        size: 0.035 + (i % 3) * 0.02,
        phase: i / 18,
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.current;
    const active = smoothstep(0.08, 0.45, p);
    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i];
      if (!node) return;
      // Scale peaks when scroll "hits" this node's phase
      const hit = 1 - Math.min(1, Math.abs(p - (0.2 + node.phase * 0.55)) * 4);
      const scale = (0.55 + hit * 0.7) * (0.4 + active * 0.6);
      child.scale.setScalar(scale);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.pos}>
          <octahedronGeometry args={[node.size]} />
          <meshStandardMaterial
            color={mono.high}
            emissive={mono.white}
            emissiveIntensity={0.7}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function ConnectionWeb({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);

  const connections = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 14; i++) {
      const theta = (i / 14) * Math.PI * 2;
      const r = 1.2 + (i % 4) * 0.5;
      pts.push(
        new THREE.Vector3(
          Math.cos(theta) * r,
          ((i % 5) - 2) * 0.3,
          Math.sin(theta) * r
        )
      );
    }
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 2.3) {
          lines.push([pts[i], pts[j]]);
        }
      }
    }
    return lines;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const active = smoothstep(0.08, 0.45, p);
    ref.current.rotation.y = p * Math.PI * 0.8;
    ref.current.children.forEach((child) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
      mat.opacity = 0.03 + active * 0.16;
    });
  });

  return (
    <group ref={ref}>
      {connections.map(([a, b], i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={mono.mid}
              transparent
              opacity={0.1}
              depthWrite={false}
            />
          </line>
        );
      })}
    </group>
  );
}

function CenterProbe({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const p = progress.current;
    const active = smoothstep(0.08, 0.45, p);
    if (ref.current) {
      ref.current.rotation.y = p * Math.PI * 2.5;
      ref.current.rotation.x = Math.sin(p * Math.PI * 2) * 0.2;
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.5 + active * 1.8;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          ref={matRef}
          color={mono.core}
          emissive={mono.white}
          emissiveIntensity={1}
          roughness={0}
          metalness={1}
          wireframe
        />
      </mesh>
      {[0, Math.PI / 2, Math.PI].map((rot, i) => (
        <mesh key={i} rotation={[rot, rot * 0.5, 0]}>
          <torusGeometry args={[0.5, 0.006, 8, 64]} />
          <meshBasicMaterial
            color={mono.high}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
