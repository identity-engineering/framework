import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gaussianEnvelope } from './gaussian';

/** Monochrome hero palette — black / white / grays only */
const C = {
  white: '#f5f5f5',
  high: '#d4d4d8',
  mid: '#a1a1aa',
  low: '#71717a',
  dim: '#52525b',
  core: '#0a0a0a',
  glow: '#e4e4e7',
} as const;

/**
 * Identity Stem / Schwerachse
 * Past (below) → Present / Mass core (center) → Future (above).
 * Substance follows a Gaussian bell around the present.
 * Vision gradient ∇𝒞 emanates from the present core upward.
 * Palette: black / white / gray only.
 */
export default function IdentityStem() {
  const stemRef = useRef<THREE.Group>(null);
  const substanceRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (stemRef.current) {
      stemRef.current.rotation.x = Math.sin(t * 0.15) * 0.025;
      stemRef.current.rotation.z = Math.cos(t * 0.12) * 0.02;
    }

    if (substanceRef.current) {
      substanceRef.current.rotation.y = t * 0.18;
    }
  });

  // Mild tilt for depth; kept modest so FitStemCamera vertical bounds stay stable
  return (
    <group ref={stemRef} rotation={[0.08, 0.28, 0]}>
      <StemFibers />
      <CoreAxis />
      <PresentCore />
      <group ref={substanceRef}>
        <GaussianMassShell />
      </group>
      <VisionGradient />
    </group>
  );
}

function StemFibers() {
  const fibers = useMemo(() => {
    const count = 28;
    const result: { points: THREE.Vector3[]; opacity: number; color: string }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const baseR = 0.035 + (i % 5) * 0.014;
      const twist = 0.55 + (i % 3) * 0.12;
      const points: THREE.Vector3[] = [];
      const segs = 48;

      for (let j = 0; j <= segs; j++) {
        const t = j / segs;
        const y = -2.4 + t * 5.0;
        const a = angle + t * twist * Math.PI * 2;
        const r = baseR * (0.55 + 0.9 * gaussianEnvelope(y, 1.0, 0.15));
        points.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }

      result.push({
        points,
        opacity: 0.1 + (i % 4) * 0.035,
        color: i % 2 === 0 ? C.mid : C.high,
      });
    }

    return result;
  }, []);

  return (
    <group>
      {fibers.map((fiber, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(fiber.points);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={fiber.color}
              transparent
              opacity={fiber.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
        );
      })}
    </group>
  );
}

function CoreAxis() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      pts.push(new THREE.Vector3(0, -2.5 + (i / 40) * 5.2, 0));
    }
    return pts;
  }, []);

  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={C.white}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
}

function PresentCore() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1.15 + Math.sin(clock.getElapsedTime() * 0.9) * 0.08;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.12, 48, 48]} />
        <meshStandardMaterial
          color={C.core}
          emissive={C.white}
          emissiveIntensity={0.55}
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial
          color={C.glow}
          transparent
          opacity={0.09}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.006, 12, 64]} />
        <meshBasicMaterial color={C.white} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function GaussianMassShell() {
  const rings = useMemo(() => {
    const levels = [-1.6, -1.1, -0.65, -0.3, 0, 0.3, 0.65, 1.1, 1.6];
    const rMax = 1.55;
    return levels.map((y, i) => {
      const env = gaussianEnvelope(y, 1.0, 0.12);
      // Brighter near present, dimmer toward poles
      const brightness = env;
      return {
        y,
        r: rMax * env,
        tube: 0.003 + env * 0.004,
        opacity: 0.05 + brightness * 0.22,
        color: Math.abs(y) < 0.35 ? C.white : Math.abs(y) < 0.9 ? C.high : C.mid,
        tilt: (i % 3 - 1) * 0.08,
      };
    });
  }, []);

  const meridians = useMemo(() => {
    const result: THREE.Vector3[][] = [];
    const rMax = 1.55;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 32; j++) {
        const t = j / 32;
        const y = -2.0 + t * 4.0;
        const r = rMax * gaussianEnvelope(y, 1.0, 0.12);
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      result.push(pts);
    }
    return result;
  }, []);

  return (
    <group>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          position={[0, ring.y, 0]}
          rotation={[Math.PI / 2 + ring.tilt, 0, i * 0.15]}
        >
          <torusGeometry args={[ring.r, ring.tube, 10, 96]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
      {meridians.map((pts, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={`m-${i}`} geometry={geometry}>
            <lineBasicMaterial
              color={C.mid}
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
        );
      })}
    </group>
  );
}

/**
 * Vision Gradient ∇𝒞 — from present core upward only.
 * Monochrome: brighter white near core, softer gray as it opens.
 */
function VisionGradient() {
  const groupRef = useRef<THREE.Group>(null);

  const fieldLines = useMemo(() => {
    const lines: { points: THREE.Vector3[]; opacity: number }[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      const segs = 20;
      const open = 0.55 + (i % 3) * 0.08;

      for (let j = 0; j <= segs; j++) {
        const t = j / segs;
        const y = 0.08 + t * 1.65;
        const env = gaussianEnvelope(y, 1.15, 0.12);
        const r = (0.14 + t * open * 0.9) * (0.5 + 0.5 * env);
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      lines.push({ points: pts, opacity: 0.1 + (i % 3) * 0.035 });
    }
    return lines;
  }, []);

  const axisPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      pts.push(new THREE.Vector3(0, 0.15 + (i / 16) * 1.5, 0));
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.65) * 0.04;
      groupRef.current.scale.set(s, 1, s);
    }
  });

  const axisGeom = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(axisPoints),
    [axisPoints]
  );

  return (
    <group ref={groupRef}>
      {fieldLines.map((line, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(line.points);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={i % 2 === 0 ? C.white : C.mid}
              transparent
              opacity={line.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
        );
      })}

      <line geometry={axisGeom}>
        <lineBasicMaterial
          color={C.white}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color={C.white}
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
