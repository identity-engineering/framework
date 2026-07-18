import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Curvature — grid warp + particle phase scrubbed by scroll only.
 */
export default function CurvatureScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas
        camera={{ position: [4.2, 3.2, 4.2], fov: 48 }}
        fogFar={16}
      >
        <ScrollProgressController progress={progress} />
        <pointLight position={[0, -1.5, 0]} intensity={1.2} color="#ffffff" />
        <SpaceGrid progress={progress} />
        <FallingParticles progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

function SpaceGrid({ progress }: { progress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const massMat = useRef<THREE.MeshStandardMaterial>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);

  const { geometries, baseXZ } = useMemo(() => {
    const size = 8;
    const divisions = 18;
    const step = size / divisions;
    const geometries: THREE.BufferGeometry[] = [];
    const baseXZ: Float32Array[] = [];

    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      {
        const n = divisions + 1;
        const arr = new Float32Array(n * 3);
        for (let j = 0; j <= divisions; j++) {
          const x = i * step;
          const z = (j - divisions / 2) * step;
          arr[j * 3] = x;
          arr[j * 3 + 1] = 0;
          arr[j * 3 + 2] = z;
        }
        baseXZ.push(arr.slice());
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        geometries.push(geo);
      }
      {
        const n = divisions + 1;
        const arr = new Float32Array(n * 3);
        for (let j = 0; j <= divisions; j++) {
          const x = (j - divisions / 2) * step;
          const z = i * step;
          arr[j * 3] = x;
          arr[j * 3 + 1] = 0;
          arr[j * 3 + 2] = z;
        }
        baseXZ.push(arr.slice());
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        geometries.push(geo);
      }
    }

    return { geometries, baseXZ };
  }, []);

  useFrame(() => {
    const p = progress.current;
    const warp = smoothstep(0.1, 0.65, p);

    if (groupRef.current) {
      groupRef.current.rotation.y = p * Math.PI * 0.6;
    }

    geometries.forEach((geo, gi) => {
      const pos = geo.attributes.position.array as Float32Array;
      const base = baseXZ[gi];
      for (let k = 0; k < pos.length; k += 3) {
        const x = base[k];
        const z = base[k + 2];
        const dist = Math.sqrt(x * x + z * z);
        pos[k] = x;
        pos[k + 1] = (-2.4 / (dist + 1.15)) * warp;
        pos[k + 2] = z;
      }
      geo.attributes.position.needsUpdate = true;
    });

    if (massMat.current) {
      massMat.current.emissiveIntensity = 0.25 + warp * 2.0;
    }
    if (glowMat.current) {
      glowMat.current.opacity = 0.02 + warp * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {geometries.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial
            color={i % 4 < 2 ? mono.high : mono.mid}
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        </line>
      ))}

      <mesh position={[0, -1.8, 0]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial
          ref={massMat}
          color={mono.core}
          emissive={mono.white}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={1}
        />
      </mesh>
      <mesh position={[0, -1.8, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial
          ref={glowMat}
          color={mono.white}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Particles: each has a fixed trajectory phase keyed by scroll (not time integration).
 * p=0 → high / outer; p=1 → deep in the well.
 */
function FallingParticles({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Points>(null);
  const count = 160;

  const seeds = useMemo(() => {
    const s = new Float32Array(count * 4); // x0, z0, phase, speed
    for (let i = 0; i < count; i++) {
      s[i * 4] = (Math.random() - 0.5) * 7.5;
      s[i * 4 + 1] = (Math.random() - 0.5) * 7.5;
      s[i * 4 + 2] = Math.random(); // phase offset
      s[i * 4 + 3] = 0.6 + Math.random() * 0.8;
    }
    return s;
  }, []);

  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const warp = smoothstep(0.1, 0.65, p);
    const pos = positions;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x0 = seeds[i * 4];
      const z0 = seeds[i * 4 + 1];
      const phase = seeds[i * 4 + 2];
      const spd = seeds[i * 4 + 3];
      // Local fall amount 0→1 along path, staggered by phase, driven by scroll
      const fall = Math.min(1, Math.max(0, (p * spd + phase * 0.35 - 0.1) / 0.85));
      const x = x0 * (1 - fall * 0.85);
      const z = z0 * (1 - fall * 0.85);
      const dist = Math.sqrt(x * x + z * z);
      const y = 3.2 - fall * 5.5 - warp * (0.8 / (dist + 0.4));

      pos[ix] = x;
      pos[ix + 1] = y;
      pos[ix + 2] = z;
    }

    const attr = ref.current.geometry.attributes.position;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = 0.2 + warp * 0.5;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={mono.white}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
