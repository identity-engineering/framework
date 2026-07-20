import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

type ProgressRef = Readonly<{ progress: React.RefObject<number> }>;

/**
 * Rotation / Gyroscopic stability — Single Identity.
 * Scroll drives stability: diffuse wobble → coherent axial spin.
 */
export default function RotationScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [2.65, 1.35, 3.15], fov: 40 }} fogFar={13}>
        <ScrollProgressController progress={progress} />
        <SingleIdentityRotor progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function SingleIdentityRotor({ progress }: ProgressRef) {
  const worldRef = useRef<THREE.Group>(null);
  const axisRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const orbitersRef = useRef<THREE.Group>(null);
  const stemGlowRef = useRef<THREE.MeshBasicMaterial>(null);
  const axisLineMat = useRef<THREE.LineBasicMaterial>(null);

  const spinAngle = useRef(Math.PI * 0.12);
  const lastP = useRef(0);

  const shellArcs = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 7; i++) {
      const lon = (i / 7) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 54; j++) {
        const lat = -Math.PI / 2 + (j / 54) * Math.PI;
        const r = 0.66;
        pts.push(
          new THREE.Vector3(
            r * Math.cos(lat) * Math.cos(lon),
            r * Math.sin(lat),
            r * Math.cos(lat) * Math.sin(lon)
          )
        );
      }
      geos.push(new THREE.BufferGeometry().setFromPoints(pts));
    }

    const eqA: THREE.Vector3[] = [];
    const eqB: THREE.Vector3[] = [];
    for (let j = 0; j <= 76; j++) {
      const a = (j / 76) * Math.PI * 2;
      eqA.push(new THREE.Vector3(Math.cos(a) * 0.69, 0, Math.sin(a) * 0.69));
      eqB.push(new THREE.Vector3(Math.cos(a) * 0.62, 0.12, Math.sin(a) * 0.62));
    }
    geos.push(
      new THREE.BufferGeometry().setFromPoints(eqA),
      new THREE.BufferGeometry().setFromPoints(eqB)
    );
    return geos;
  }, []);

  const axisGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.28, 0),
      new THREE.Vector3(0, 1.28, 0),
    ]);
  }, []);

  const stabilizingRings = useMemo(() => [{ r: 0.93, y: 0 }, { r: 1.11, y: 0.08 }, { r: 1.11, y: -0.08 }], []);

  const orbiters = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        key: `orb-${i}`,
        radius: 0.95 + (i % 4) * 0.07,
        phase: (i / 16) * Math.PI * 2,
        lift: -0.26 + (i % 5) * 0.12,
      })),
    []
  );

  useFrame(() => {
    const p = progress.current ?? 0;
    const spin = smoothstep(0.08, 0.72, p);
    const stability = smoothstep(0.2, 0.92, p);
    const coherence = smoothstep(0.34, 0.98, p);

    const dp = p - lastP.current;
    lastP.current = p;
    spinAngle.current += dp * (18 + spin * 44);

    if (rotorRef.current) {
      rotorRef.current.rotation.y = spinAngle.current + p * Math.PI * 4.6;
    }

    const wobbleAmp = (1 - stability) * 0.13;
    const wobble = Math.sin(p * Math.PI * 9.3) * wobbleAmp;

    if (axisRef.current) {
      const tilt = THREE.MathUtils.lerp(0.44, 0.2, stability);
      axisRef.current.rotation.z = tilt + wobble;
      axisRef.current.rotation.x = Math.cos(p * Math.PI * 5.1) * wobbleAmp * 0.24;
    }

    if (worldRef.current) {
      worldRef.current.rotation.y = p * Math.PI * 0.42;
    }

    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        const base = i === 0 ? 0.18 : 0.1;
        mat.opacity = base * (0.12 + stability * 1.05);
        const s = 1 + (1 - stability) * 0.07 * Math.sin(p * 14 + i * 0.7);
        child.scale.set(s, 1, s);
      });
    }

    if (orbitersRef.current) {
      orbitersRef.current.children.forEach((child, i) => {
        const node = child as THREE.Mesh;
        const conf = orbiters[i];
        if (!conf) return;
        const angle = conf.phase + p * (2.2 + (i % 3) * 0.33) * Math.PI;
        const radialBreath = Math.sin(p * Math.PI * 8 + i * 0.75) * (1 - coherence) * 0.12;
        const r = conf.radius + radialBreath;
        node.position.set(Math.cos(angle) * r, conf.lift * (0.65 + coherence * 0.35), Math.sin(angle) * r);
        const mat = node.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.16 + coherence * 0.52;
      });
    }

    if (axisLineMat.current) {
      axisLineMat.current.opacity = 0.2 + stability * 0.62;
    }
    if (stemGlowRef.current) {
      stemGlowRef.current.opacity = 0.08 + coherence * 0.3;
    }
  });

  return (
    <group ref={worldRef}>
      <group ref={axisRef}>
        <line geometry={axisGeo}>
          <lineBasicMaterial
            ref={axisLineMat}
            color={mono.white}
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </line>

        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 2.22, 20, 1, true]} />
          <meshBasicMaterial ref={stemGlowRef} color={mono.high} transparent opacity={0.15} depthWrite={false} />
        </mesh>

        <mesh position={[0, 1.22, 0]}>
          <sphereGeometry args={[0.046, 12, 12]} />
          <meshBasicMaterial color={mono.white} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -1.22, 0]}>
          <sphereGeometry args={[0.046, 12, 12]} />
          <meshBasicMaterial color={mono.mid} transparent opacity={0.74} />
        </mesh>

        <group ref={rotorRef}>
          <mesh>
            <sphereGeometry args={[0.66, 42, 42]} />
            <meshBasicMaterial color={mono.low} wireframe transparent opacity={0.08} depthWrite={false} />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.6, 36, 36]} />
            <meshBasicMaterial color={mono.high} wireframe transparent opacity={0.06} depthWrite={false} />
          </mesh>

          {shellArcs.map((geo, i) => (
            <line key={i} geometry={geo}>
              <lineBasicMaterial
                color={i >= shellArcs.length - 2 ? mono.white : mono.mid}
                transparent
                opacity={i >= shellArcs.length - 2 ? 0.34 : 0.18}
                depthWrite={false}
              />
            </line>
          ))}

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.68, 0.007, 8, 72]} />
            <meshBasicMaterial color={mono.high} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>

        <group ref={ringsRef}>
          {stabilizingRings.map((ring, i) => (
            <mesh key={i} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[ring.r, 0.006, 8, 80]} />
              <meshBasicMaterial
                color={mono.white}
                transparent
                opacity={i === 0 ? 0.16 : 0.1}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>

        <group ref={orbitersRef}>
          {orbiters.map((o) => (
            <mesh key={o.key} position={[Math.cos(o.phase) * o.radius, o.lift, Math.sin(o.phase) * o.radius]}>
              <sphereGeometry args={[0.025, 10, 10]} />
              <meshBasicMaterial color={mono.white} transparent opacity={0.24} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>

    </group>
  );
}
