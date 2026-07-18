import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Time / Identity Stem — Framework only.
 * Clean temporal strand: precise fibers past → future.
 * No mass, no gyro. Professional, controlled geometry.
 */
export default function StemScrollScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [2.1, 0.2, 5.0], fov: 38 }} fogFar={13}>
        <ScrollProgressController progress={progress} />
        <pointLight position={[2, 1.5, 3]} intensity={0.5} color="#ffffff" />
        <TimeStrand progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

const Y0 = -2.2;
const Y1 = 2.25;
const SPAN = Y1 - Y0;
const SEGS = 72;

function TimeStrand({ progress }: { progress: React.MutableRefObject<number> }) {
  const rootRef = useRef<THREE.Group>(null);
  const fiberMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const sparkRef = useRef<THREE.Points>(null);
  const spineMat = useRef<THREE.LineBasicMaterial>(null);
  const presentMats = useRef<(THREE.MeshBasicMaterial | THREE.LineBasicMaterial | null)[]>([]);

  /**
   * Concentric fiber layers — even angular spacing, controlled helix.
   * Past: slightly looser radius. Future: converges toward axis (coherence).
   */
  const fibers = useMemo(() => {
    // layers: [count, radius at past, radius at future, twist turns, opacity weight]
    const layers: [number, number, number, number, number][] = [
      [6, 0.045, 0.028, 0.55, 0.55], // core
      [12, 0.11, 0.07, 0.4, 0.32],
      [18, 0.19, 0.12, 0.28, 0.2],
      [24, 0.28, 0.18, 0.18, 0.12], // outer sheath
    ];

    const list: {
      geo: THREE.BufferGeometry;
      opacity: number;
      color: string;
      points: THREE.Vector3[];
    }[] = [];

    for (const [count, rPast, rFuture, turns, opacity] of layers) {
      for (let i = 0; i < count; i++) {
        const angle0 = (i / count) * Math.PI * 2;
        const pts: THREE.Vector3[] = [];

        for (let j = 0; j <= SEGS; j++) {
          const t = j / SEGS;
          const y = Y0 + t * SPAN;
          // Smooth radius: past wide → future tighter (alignment, not mass)
          const r = THREE.MathUtils.lerp(rPast, rFuture, smoothstep(0, 1, t));
          // Single clean helix — no multi-frequency noise
          const a = angle0 + t * turns * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
        }

        list.push({
          geo: new THREE.BufferGeometry().setFromPoints(pts),
          opacity,
          color:
            opacity > 0.4 ? mono.white : opacity > 0.25 ? mono.high : mono.mid,
          points: pts,
        });
      }
    }
    return list;
  }, []);

  const spine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= SEGS; j++) {
      pts.push(new THREE.Vector3(0, Y0 + (j / SEGS) * SPAN, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Fewer sparks, locked to fiber samples — precise beads of light
  const sparkCount = 48;
  const sparkMeta = useMemo(() => {
    const fiberIdx = new Int16Array(sparkCount);
    const phase = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
      // Prefer mid/outer layers for readability
      fiberIdx[i] = 6 + Math.floor((i / sparkCount) * (fibers.length - 8));
      phase[i] = (i * 0.6180339887) % 1;
    }
    return { fiberIdx, phase, positions: new Float32Array(sparkCount * 3) };
  }, [fibers]);

  useFrame(() => {
    const p = progress.current;
    const reveal = smoothstep(0.04, 0.62, p);
    const flow = smoothstep(0.18, 0.92, p);
    const present = smoothstep(0.22, 0.48, p);

    if (rootRef.current) {
      // Minimal view turn — elegant, not busy
      rootRef.current.rotation.y = 0.32 + p * 0.28;
      rootRef.current.rotation.x = 0.07;
    }

    // Draw fibers from past upward (clip by t-reveal along each path via opacity only)
    fiberMats.current.forEach((mat, i) => {
      if (!mat) return;
      const layerBoost = fibers[i]?.opacity ?? 0.15;
      // Stagger by layer index groups
      const layer = i < 6 ? 0 : i < 18 ? 1 : i < 36 ? 2 : 3;
      const on = smoothstep(layer * 0.06, 0.25 + layer * 0.12, reveal);
      mat.opacity = layerBoost * on;
    });

    if (spineMat.current) {
      spineMat.current.opacity = 0.2 + reveal * 0.45;
    }

    presentMats.current.forEach((mat) => {
      if (mat && 'opacity' in mat) mat.opacity = present * 0.5;
    });

    // Sparks: clean parametric position along chosen fiber
    if (sparkRef.current) {
      const pos = sparkMeta.positions;
      for (let i = 0; i < sparkCount; i++) {
        const fi = Math.min(fibers.length - 1, Math.max(0, sparkMeta.fiberIdx[i]));
        const pts = fibers[fi].points;
        // Even spacing along strand, scrubbed by scroll
        let t = (sparkMeta.phase[i] * 0.85 + flow * 0.95) % 1;
        t = Math.min(t, reveal * 0.98);
        const idx = Math.min(pts.length - 1, Math.floor(t * (pts.length - 1)));
        const pt = pts[idx];
        pos[i * 3] = pt.x;
        pos[i * 3 + 1] = pt.y;
        pos[i * 3 + 2] = pt.z;
      }
      const attr = sparkRef.current.geometry.attributes.position;
      (attr.array as Float32Array).set(pos);
      attr.needsUpdate = true;
      const mat = sparkRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.2 + flow * 0.65;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Subtle axis bloom — thin, controlled */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.045, SPAN * 0.92, 20, 1, true]} />
        <meshBasicMaterial
          color={mono.white}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Fibers */}
      {fibers.map((f, i) => (
        <line key={i} geometry={f.geo}>
          <lineBasicMaterial
            ref={(m) => {
              fiberMats.current[i] = m;
            }}
            color={f.color}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}

      {/* Spine */}
      <line geometry={spine}>
        <lineBasicMaterial
          ref={spineMat}
          color={mono.white}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* Sparks */}
      <points ref={sparkRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparkCount}
            array={sparkMeta.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          color={mono.white}
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Present cross-section — precise plane */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.32, 64]} />
          <meshBasicMaterial
            ref={(m) => {
              presentMats.current[0] = m;
            }}
            color={mono.white}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.004, 8, 64]} />
          <meshBasicMaterial
            ref={(m) => {
              presentMats.current[1] = m;
            }}
            color={mono.white}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        {Array.from({ length: 8 }).map((_, k) => {
          const a = (k / 8) * Math.PI * 2;
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32),
            new THREE.Vector3(Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42),
          ]);
          return (
            <line key={k} geometry={geo}>
              <lineBasicMaterial
                ref={(m) => {
                  presentMats.current[2 + k] = m;
                }}
                color={mono.high}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </line>
          );
        })}
      </group>

      {/* Poles — small, sharp */}
      <mesh position={[0, Y0, 0]}>
        <sphereGeometry args={[0.035, 20, 20]} />
        <meshBasicMaterial color={mono.mid} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, Y1, 0]}>
        <sphereGeometry args={[0.04, 20, 20]} />
        <meshBasicMaterial
          color={mono.white}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
