import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Mass — motion and density driven only by scroll progress (no idle clock).
 * Hero stays continuous; this freezes between scroll events.
 */
export default function MassScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [0, 1.4, 5.2], fov: 48 }}>
        <ScrollProgressController progress={progress} />
        <MassCore progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function MassCore({ progress }: { progress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const shellsRef = useRef<THREE.Group>(null);
  const fieldsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progress.current;
    // Density builds through the first half of the section scroll
    const density = smoothstep(0.12, 0.55, p);
    // Rotation scrubs with scroll (not time)
    const angle = p * Math.PI * 1.4;

    if (groupRef.current) {
      groupRef.current.rotation.y = angle;
    }

    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 0.2 + density * 1.5;
    }
    if (glowMat.current) {
      glowMat.current.opacity = 0.03 + density * 0.12;
      const s = 1.05 + density * 0.35;
      glowMat.current.parent?.scale.setScalar(s);
    }

    if (shellsRef.current) {
      shellsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const base = 0.04 - i * 0.008;
        mat.opacity = base * (0.2 + density * 1.0);
        mesh.scale.setScalar(0.85 + density * 0.2);
        mesh.rotation.x = angle * 0.15 * (i + 1);
        mesh.rotation.z = angle * 0.1 * (i + 1);
      });
    }

    if (fieldsRef.current) {
      fieldsRef.current.rotation.y = angle * 0.35;
      fieldsRef.current.children.forEach((child) => {
        const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
        mat.opacity = 0.03 + density * 0.16;
      });
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.38, 64, 64]} />
        <meshStandardMaterial
          ref={coreMat}
          color={mono.core}
          emissive={mono.white}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial
          ref={glowMat}
          color={mono.high}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <group ref={shellsRef}>
        {[0.75, 1.15, 1.65, 2.25].map((r, i) => (
          <mesh key={i}>
            <sphereGeometry args={[r, 28, 28]} />
            <meshBasicMaterial
              color={i < 2 ? mono.high : mono.mid}
              transparent
              opacity={0.05}
              wireframe
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <group ref={fieldsRef}>
        <FieldLines />
      </group>
    </group>
  );
}

function FieldLines() {
  const lines = useMemo(() => {
    const result: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 22; i++) {
      const points: THREE.Vector3[] = [];
      const theta = (i / 22) * Math.PI * 2;
      for (let j = 0; j < 28; j++) {
        const t = j / 28;
        const r = 0.5 + t * 2.9;
        const spiral = theta + t * 0.45;
        const yOff = Math.sin(i * 1.7 + j * 0.4) * 0.12 * t;
        points.push(
          new THREE.Vector3(Math.cos(spiral) * r, yOff, Math.sin(spiral) * r)
        );
      }
      result.push(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.CatmullRomCurve3(points).getPoints(36)
        )
      );
    }
    return result;
  }, []);

  return (
    <>
      {lines.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial
            color={mono.mid}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </line>
      ))}
    </>
  );
}
