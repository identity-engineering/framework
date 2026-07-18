import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Gravitation — orbital angles + pull strength scrubbed by scroll only.
 */
export default function GravitationScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [0, 2, 6], fov: 48 }} fogFar={15}>
        <ScrollProgressController progress={progress} />
        <CentralAttractor progress={progress} />
        <OrbitalBodies progress={progress} />
        <AttractionLines progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function CentralAttractor({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const p = progress.current;
    const pull = smoothstep(0.12, 0.6, p);
    if (ref.current) ref.current.rotation.y = p * Math.PI * 2.2;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.2 + pull * 0.55);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.35 + pull * 1.5;
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.35, 2]} />
        <meshStandardMaterial
          ref={matRef}
          color={mono.core}
          emissive={mono.white}
          emissiveIntensity={0.8}
          roughness={0}
          metalness={1}
          wireframe
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={mono.high}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function OrbitalBodies({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const bodies = useMemo(() => {
    const arr: {
      radius: number;
      size: number;
      offset: number;
      tilt: number;
      revs: number;
    }[] = [];
    for (let i = 0; i < 12; i++) {
      arr.push({
        radius: 1.5 + i * 0.38,
        size: 0.05 + (i % 3) * 0.025,
        offset: (i / 12) * Math.PI * 2,
        tilt: ((i % 5) - 2) * 0.12,
        revs: 0.6 + (i % 4) * 0.25, // how many revolutions over full scroll
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.current;
    const pull = smoothstep(0.12, 0.6, p);
    const rScale = 1.2 - pull * 0.35;

    groupRef.current.children.forEach((child, i) => {
      if (i >= bodies.length) return;
      const body = bodies[i];
      const angle = body.offset + p * Math.PI * 2 * body.revs;
      const r = body.radius * rScale;
      child.position.x = Math.cos(angle) * r;
      child.position.y = Math.sin(angle * 0.5) * body.tilt * (0.5 + pull);
      child.position.z = Math.sin(angle) * r;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.25 + pull * 1.0;
    });
  });

  return (
    <group ref={groupRef}>
      {bodies.map((body, i) => (
        <mesh key={i}>
          <sphereGeometry args={[body.size, 14, 14]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? mono.high : mono.mid}
            emissive={mono.white}
            emissiveIntensity={0.5}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function AttractionLines({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);

  const curves = useMemo(() => {
    const result: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 24; i++) {
      const theta = (i / 24) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j < 18; j++) {
        const t = j / 18;
        const r = 4.5 * (1 - t * t);
        points.push(
          new THREE.Vector3(
            Math.cos(theta + t * 1.2) * r,
            Math.sin(i * 0.7 + j * 0.3) * 0.08 * t,
            Math.sin(theta + t * 1.2) * r
          )
        );
      }
      result.push(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.CatmullRomCurve3(points).getPoints(24)
        )
      );
    }
    return result;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const pull = smoothstep(0.12, 0.6, p);
    ref.current.rotation.y = p * Math.PI * 0.5;
    ref.current.children.forEach((child) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
      mat.opacity = 0.025 + pull * 0.14;
    });
  });

  return (
    <group ref={ref}>
      {curves.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial
            color={mono.mid}
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
}
