import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * PlatoScene — a face portrait rendered as three-layer wireframe geometry.
 * Three layers map to the tripartite soul: reason (top), spirit (mid), appetite (base).
 * All motion is scroll-scrubbed, no idle clock.
 */
export default function PlatoScene() {
  const progress = useRef(0);

  return (
    <div className="w-full h-full">
      <ConceptCanvas camera={{ position: [0, 0, 3.8], fov: 46 }}>
        <ScrollProgressController progress={progress} />
        <FacePortrait progress={progress} />
      </ConceptCanvas>
    </div>
  );
}

// ── Landmark points for a front-facing face silhouette ──────────────────────
// Coordinates in [-1, 1] range, z used for slight depth layering.
// Groups: reason=head/brow (top), spirit=eyes/nose/cheeks (mid), appetite=mouth/jaw (base).

const REASON_POINTS: [number, number, number][] = [
  // cranium arc
  [-0.38, 1.12, 0.0], [-0.22, 1.22, 0.02], [0.0, 1.28, 0.03],
  [0.22, 1.22, 0.02], [0.38, 1.12, 0.0],
  // brow ridge
  [-0.42, 0.62, 0.06], [-0.26, 0.68, 0.08], [-0.10, 0.65, 0.07],
  [0.10, 0.65, 0.07], [0.26, 0.68, 0.08], [0.42, 0.62, 0.06],
  // temples
  [-0.52, 0.82, 0.0], [0.52, 0.82, 0.0],
];

const SPIRIT_POINTS: [number, number, number][] = [
  // left eye outline
  [-0.34, 0.48, 0.12], [-0.22, 0.52, 0.14], [-0.12, 0.48, 0.12],
  [-0.22, 0.42, 0.12],
  // right eye outline
  [0.12, 0.48, 0.12], [0.22, 0.52, 0.14], [0.34, 0.48, 0.12],
  [0.22, 0.42, 0.12],
  // nose bridge + tip
  [0.0, 0.56, 0.16], [0.0, 0.38, 0.20], [0.0, 0.18, 0.22],
  // nose wings
  [-0.14, 0.16, 0.18], [0.14, 0.16, 0.18],
  // cheekbones
  [-0.58, 0.28, 0.04], [0.58, 0.28, 0.04],
  [-0.52, 0.48, 0.02], [0.52, 0.48, 0.02],
];

const APPETITE_POINTS: [number, number, number][] = [
  // upper lip
  [-0.20, -0.04, 0.18], [-0.10, 0.00, 0.20], [0.0, 0.02, 0.20],
  [0.10, 0.00, 0.20], [0.20, -0.04, 0.18],
  // lower lip
  [-0.18, -0.14, 0.18], [0.0, -0.18, 0.20], [0.18, -0.14, 0.18],
  // jaw line
  [-0.58, -0.08, 0.02], [-0.52, -0.36, 0.02], [-0.36, -0.62, 0.02],
  [0.0, -0.76, 0.04],
  [0.36, -0.62, 0.02], [0.52, -0.36, 0.02], [0.58, -0.08, 0.02],
  // chin
  [-0.12, -0.68, 0.08], [0.0, -0.72, 0.10], [0.12, -0.68, 0.08],
];

// Edges: pairs of indices within each layer forming the wireframe lines
function buildLayerEdges(pts: [number, number, number][]): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    edges.push([i, i + 1]);
  }
  // close first group arcs explicitly
  return edges;
}

function makeEdgeGeometries(
  pts: [number, number, number][],
  edges: [number, number][]
): THREE.BufferGeometry[] {
  const scale = 0.88;
  const vecs = pts.map(([x, y, z]) => new THREE.Vector3(x * scale, y * scale, z * scale));
  return edges.map(([a, b]) => {
    const geo = new THREE.BufferGeometry().setFromPoints([vecs[a], vecs[b]]);
    return geo;
  });
}

function makePointGeometry(pts: [number, number, number][]): THREE.BufferGeometry {
  const scale = 0.88;
  const vecs = pts.map(([x, y, z]) => new THREE.Vector3(x * scale, y * scale, z * scale));
  return new THREE.BufferGeometry().setFromPoints(vecs);
}

// ── Layer component ──────────────────────────────────────────────────────────

interface LayerProps {
  pts: [number, number, number][];
  progress: React.MutableRefObject<number>;
  activateAt: number;   // progress value at which this layer fully appears
  color: string;
  zOffset?: number;
}

function FaceLayer({ pts, progress, activateAt, color, zOffset = 0 }: LayerProps) {
  const edges = useMemo(() => buildLayerEdges(pts), [pts]);
  const edgeGeos = useMemo(() => makeEdgeGeometries(pts, edges), [pts, edges]);
  const pointGeo = useMemo(() => makePointGeometry(pts), [pts]);

  const linesRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    const p = progress.current;
    const fade = smoothstep(activateAt, activateAt + 0.25, p);
    const globalRotate = p * Math.PI * 0.18;

    if (linesRef.current) {
      linesRef.current.rotation.y = globalRotate;
      linesRef.current.position.z = zOffset;
      linesRef.current.children.forEach((child) => {
        const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
        mat.opacity = 0.04 + fade * 0.55;
      });
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = globalRotate;
      pointsRef.current.position.z = zOffset;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.2 + fade * 0.7;
      mat.size = 0.012 + fade * 0.018;
    }
  });

  return (
    <>
      <group ref={linesRef}>
        {edgeGeos.map((geo, i) => (
          <line key={i} geometry={geo}>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={0.04}
              depthWrite={false}
            />
          </line>
        ))}
      </group>
      <points ref={pointsRef} geometry={pointGeo}>
        <pointsMaterial
          color={color}
          transparent
          opacity={0.2}
          size={0.012}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}

// ── Cross-layer connecting lines ─────────────────────────────────────────────

function ConnectingLines({ progress }: { progress: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const connections: [THREE.Vector3, THREE.Vector3][] = [
      // cranium to temple
      [new THREE.Vector3(-0.34, 1.0, 0.0), new THREE.Vector3(-0.52, 0.82, 0.0)],
      [new THREE.Vector3(0.34, 1.0, 0.0), new THREE.Vector3(0.52, 0.82, 0.0)],
      // brow to cheek
      [new THREE.Vector3(-0.42, 0.62, 0.06), new THREE.Vector3(-0.52, 0.48, 0.02)],
      [new THREE.Vector3(0.42, 0.62, 0.06), new THREE.Vector3(0.52, 0.48, 0.02)],
      // cheek to jaw
      [new THREE.Vector3(-0.58, 0.28, 0.04), new THREE.Vector3(-0.52, -0.08, 0.02)],
      [new THREE.Vector3(0.58, 0.28, 0.04), new THREE.Vector3(0.52, -0.08, 0.02)],
      // temple to jaw top
      [new THREE.Vector3(-0.52, 0.82, 0.0), new THREE.Vector3(-0.58, -0.08, 0.02)],
      [new THREE.Vector3(0.52, 0.82, 0.0), new THREE.Vector3(0.58, -0.08, 0.02)],
      // nose bridge down
      [new THREE.Vector3(0.0, 0.56, 0.16), new THREE.Vector3(-0.14, 0.16, 0.18)],
      [new THREE.Vector3(0.0, 0.56, 0.16), new THREE.Vector3(0.14, 0.16, 0.18)],
    ];
    const scale = 0.88;
    return connections.map(([a, b]) =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x * scale, a.y * scale, a.z * scale),
        new THREE.Vector3(b.x * scale, b.y * scale, b.z * scale),
      ])
    );
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const fade = smoothstep(0.18, 0.65, p);
    ref.current.rotation.y = p * Math.PI * 0.18;
    ref.current.children.forEach((child) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
      mat.opacity = 0.02 + fade * 0.22;
    });
  });

  return (
    <group ref={ref}>
      {geos.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial
            color={mono.dim}
            transparent
            opacity={0.02}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
}

// ── Root face group ──────────────────────────────────────────────────────────

function FacePortrait({ progress }: { progress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.current;
    // subtle vertical drift as face "settles"
    groupRef.current.position.y = 0.05 * (1 - smoothstep(0.1, 0.5, p));
  });

  return (
    <group ref={groupRef}>
      {/* reason — cranium + brow — appears first */}
      <FaceLayer
        pts={REASON_POINTS}
        progress={progress}
        activateAt={0.05}
        color={mono.high}
        zOffset={0}
      />
      {/* spirit — eyes + nose + cheeks */}
      <FaceLayer
        pts={SPIRIT_POINTS}
        progress={progress}
        activateAt={0.22}
        color={mono.mid}
        zOffset={0.01}
      />
      {/* appetite — mouth + jaw */}
      <FaceLayer
        pts={APPETITE_POINTS}
        progress={progress}
        activateAt={0.42}
        color={mono.low}
        zOffset={0.0}
      />
      <ConnectingLines progress={progress} />
    </group>
  );
}
