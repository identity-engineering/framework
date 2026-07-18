import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Rotation / Gyroscopic stability — Framework page only.
 * Scroll drives spin rate: slow spin → wobble; high spin → stable axis (Earth / Kreisel).
 */
export default function RotationScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [2.8, 1.6, 3.4], fov: 42 }} fogFar={14}>
        <ScrollProgressController progress={progress} />
        <GyroBody progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function GyroBody({ progress }: { progress: React.MutableRefObject<number> }) {
  // Outer mount: slow precession / tilt of the whole system
  const mountRef = useRef<THREE.Group>(null);
  // Spin axis group: holds the rotating body
  const axisRef = useRef<THREE.Group>(null);
  // The body that spins around local Y (like Earth / gyroscope rotor)
  const rotorRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Group>(null);
  const axisLineMat = useRef<THREE.LineBasicMaterial>(null);
  const tipGlow = useRef<THREE.MeshBasicMaterial>(null);

  // Accumulated spin angle from scroll (not clock)
  const spinAngle = useRef(0);
  const lastP = useRef(0);

  // Meridian lines on the sphere (Earth-like)
  const meridians = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const lon = (i / 8) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 48; j++) {
        const lat = -Math.PI / 2 + (j / 48) * Math.PI;
        const r = 0.72;
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
    // Equator
    const eq: THREE.Vector3[] = [];
    for (let j = 0; j <= 64; j++) {
      const a = (j / 64) * Math.PI * 2;
      eq.push(new THREE.Vector3(Math.cos(a) * 0.72, 0, Math.sin(a) * 0.72));
    }
    geos.push(new THREE.BufferGeometry().setFromPoints(eq));
    return geos;
  }, []);

  // Spin-axis line (north–south)
  const axisGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.35, 0),
      new THREE.Vector3(0, 1.35, 0),
    ]);
  }, []);

  // Angular-momentum “ghost” trails — rings that read as stable when spin is high
  const stabRings = useMemo(
    () => [
      { r: 0.95, y: 0, opacity: 0.2 },
      { r: 1.15, y: 0.08, opacity: 0.1 },
      { r: 1.15, y: -0.08, opacity: 0.1 },
    ],
    []
  );

  useFrame(() => {
    const p = progress.current;
    const spin = smoothstep(0.1, 0.75, p); // 0 = no spin / unstable · 1 = full gyro
    const stability = smoothstep(0.25, 0.85, p);

    // Advance rotor angle proportional to scroll delta (scrub + direction)
    const dp = p - lastP.current;
    lastP.current = p;
    // Base orientation from absolute progress + extra spin from scrolling
    spinAngle.current = p * Math.PI * 6 + dp * 40;

    if (rotorRef.current) {
      rotorRef.current.rotation.y = spinAngle.current;
    }

    // Wobble shrinks as spin/stability rises (Kreisel: L high → precession slow, upright)
    const wobbleAmp = (1 - stability) * 0.38;
    const wobble = Math.sin(p * Math.PI * 8) * wobbleAmp;

    if (axisRef.current) {
      // Axial tilt like Earth (~23°) reduced toward upright when stable
      const tilt = THREE.MathUtils.lerp(0.55, 0.22, stability);
      axisRef.current.rotation.z = tilt + wobble;
      axisRef.current.rotation.x = Math.cos(p * Math.PI * 5) * wobbleAmp * 0.5;
    }

    if (mountRef.current) {
      // Slow azimuth from scroll only
      mountRef.current.rotation.y = p * Math.PI * 0.45;
    }

    // Stability rings: more opaque / tighter when spinning hard
    if (trailRef.current) {
      trailRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        const base = stabRings[i]?.opacity ?? 0.1;
        mat.opacity = base * (0.15 + stability * 0.95);
        const s = 1 + (1 - stability) * 0.12 * Math.sin(p * 20 + i);
        child.scale.set(s, 1, s);
      });
    }

    if (axisLineMat.current) {
      axisLineMat.current.opacity = 0.25 + stability * 0.55;
    }
    if (tipGlow.current) {
      tipGlow.current.opacity = 0.05 + stability * 0.25;
    }
  });

  return (
    <group ref={mountRef}>
      <group ref={axisRef}>
        {/* Spin axis */}
        <line geometry={axisGeo}>
          <lineBasicMaterial
            ref={axisLineMat}
            color={mono.white}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </line>

        {/* Axis tips — poles */}
        <mesh position={[0, 1.32, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color={mono.white} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -1.32, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color={mono.mid} transparent opacity={0.7} />
        </mesh>

        {/* Rotor: sphere + meridians (Earth / Kreisel rotor) */}
        <group ref={rotorRef}>
          <mesh>
            <sphereGeometry args={[0.72, 48, 48]} />
            <meshStandardMaterial
              color={mono.core}
              emissive={mono.white}
              emissiveIntensity={0.15}
              roughness={0.35}
              metalness={0.85}
              transparent
              opacity={0.92}
            />
          </mesh>

          {meridians.map((geo, i) => (
            <line key={i} geometry={geo}>
              <lineBasicMaterial
                color={i === meridians.length - 1 ? mono.white : mono.mid}
                transparent
                opacity={i === meridians.length - 1 ? 0.45 : 0.22}
                depthWrite={false}
              />
            </line>
          ))}

          {/* Equatorial ridge — angular momentum disc hint */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.74, 0.012, 8, 64]} />
            <meshBasicMaterial color={mono.high} transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>

        {/* Stability / angular-momentum rings (not spinning with rotor — show axis stability) */}
        <group ref={trailRef}>
          {stabRings.map((ring, i) => (
            <mesh key={i} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[ring.r, 0.006, 8, 80]} />
              <meshBasicMaterial
                color={mono.white}
                transparent
                opacity={ring.opacity}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>

        {/* Soft polar glow when stable */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial
            ref={tipGlow}
            color={mono.white}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Ground reference — “floor of possibility” so tilt reads clearly */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
        <ringGeometry args={[0.4, 1.6, 64]} />
        <meshBasicMaterial
          color={mono.dim}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
