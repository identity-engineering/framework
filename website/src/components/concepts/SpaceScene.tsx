// @ts-nocheck
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

type ProgressRef = Readonly<{ progress: React.RefObject<number> }>;

/**
 * Space — birth of degrees of freedom from void.
 * Visual logic:
 * - Starts in absolute stillness. All structure at origin, invisible.
 * - Scroll 0→0.3: first particles drift outward from origin (degrees of freedom emerge).
 * - Scroll 0.3→0.7: relational distance lines appear between nearby dots (order of positions).
 * - Scroll 0.7→1.0: configuration stabilises into a quiet relational field.
 * Filigree aesthetic matching FrequencyScene: thin lines, wireframe dots, low opacity.
 */
export default function SpaceScene() {
	const progress = useRef(0);

	return (
		<div className="w-full h-full">
			<ConceptCanvas camera={{ position: [0, 1.1, 5.8], fov: 46 }} fogFar={18}>
				<ScrollProgressController progress={progress} />
				<EmergingDots progress={progress} />
				<RelationalDistances progress={progress} />
				<BackgroundDust progress={progress} />
			</ConceptCanvas>
		</div>
	);
}

// Fixed seed positions: each dot has a "target" it drifts toward from origin
const DOT_COUNT = 28;

function buildDotData() {
	const arr: { target: THREE.Vector3; size: number; birthPhase: number; driftPhase: number }[] = [];
	// deterministic positions via index-based trig — no Math.random (breaks resume)
	for (let i = 0; i < DOT_COUNT; i++) {
		const theta = (i / DOT_COUNT) * Math.PI * 2 + (i % 5) * 0.31;
		const phi = ((i % 7) - 3) * 0.19;
		const r = 0.5 + (i % 6) * 0.32;
		arr.push({
			target: new THREE.Vector3(
				Math.cos(theta) * r * Math.cos(phi),
				Math.sin(phi) * 1.2,
				Math.sin(theta) * r * Math.cos(phi),
			),
			size: 0.018 + (i % 4) * 0.008,
			birthPhase: (i / DOT_COUNT) * 0.55,   // staggered: first dots appear early, last ones late
			driftPhase: i * 0.14,
		});
	}
	return arr;
}

function EmergingDots({ progress }: ProgressRef) {
	const groupRef = useRef<THREE.Group>(null);
	const dots = useMemo(() => buildDotData(), []);

	useFrame((state) => {
		if (!groupRef.current) return;
		const p = progress.current;
		const t = state.clock.elapsedTime;

		// Gentle slow rotation of the whole field once emerged
		groupRef.current.rotation.y = p * Math.PI * 0.4;

		groupRef.current.children.forEach((child, i) => {
			const d = dots[i];
			if (!d) return;

			// Each dot has its own birth threshold — staggered emergence
			const emerge = smoothstep(d.birthPhase, d.birthPhase + 0.22, p);

			// Position: lerp from origin toward target
			const mesh = child as THREE.Mesh;
			mesh.position.lerpVectors(new THREE.Vector3(0, 0, 0), d.target, emerge);

			// Tiny drift shimmer once visible (breathing feel)
			const shimmer = emerge * 0.012;
			mesh.position.x += Math.sin(t * 1.3 + d.driftPhase) * shimmer;
			mesh.position.y += Math.cos(t * 1.7 + d.driftPhase * 1.4) * shimmer * 0.7;

			// Scale and brightness
			mesh.scale.setScalar(emerge);
			const mat = mesh.material as THREE.MeshStandardMaterial;
			if (mat) mat.emissiveIntensity = 0.3 + emerge * 0.9;
		});
	});

	return (
		<group ref={groupRef}>
			{dots.map((d, i) => (
				<mesh key={i} position={[0, 0, 0]}>
					{/* wireframe icosahedron — filigree, not solid */}
					<icosahedronGeometry args={[d.size, 0]} />
					<meshStandardMaterial
						color={mono.high}
						emissive={mono.white}
						emissiveIntensity={0.4}
						roughness={0.05}
						metalness={0.8}
						wireframe
					/>
				</mesh>
			))}
		</group>
	);
}

function RelationalDistances({ progress }: ProgressRef) {
	const groupRef = useRef<THREE.Group>(null);
	const dots = useMemo(() => buildDotData(), []);

	// Build edges between nearby dots (distance threshold)
	const edges = useMemo(() => {
		const result: { a: THREE.Vector3; b: THREE.Vector3; midDist: number }[] = [];
		for (let i = 0; i < dots.length; i++) {
			for (let j = i + 1; j < dots.length; j++) {
				const dist = dots[i].target.distanceTo(dots[j].target);
				if (dist < 1.05) {
					result.push({ a: dots[i].target, b: dots[j].target, midDist: dist });
				}
			}
		}
		return result;
	}, [dots]);

	useFrame(() => {
		if (!groupRef.current) return;
		const p = progress.current;

		// Lines appear after dots start emerging, fade in gradually
		const linesPhase = smoothstep(0.3, 0.72, p);
		// Mirror dot group rotation
		groupRef.current.rotation.y = p * Math.PI * 0.4;

		groupRef.current.children.forEach((child, i) => {
			const edge = edges[i];
			if (!edge) return;
			// Stagger line appearance by edge index
			const edgeAppear = smoothstep(0.28 + (i / edges.length) * 0.22, 0.5 + (i / edges.length) * 0.2, p);
			const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
			if (mat) mat.opacity = edgeAppear * 0.14 * linesPhase;
		});
	});

	return (
		<group ref={groupRef}>
			{edges.map(({ a, b }, i) => {
				const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
				return (
					<line key={i} geometry={geometry}>
						<lineBasicMaterial
							color={mono.mid}
							transparent
							opacity={0}
							depthWrite={false}
						/>
					</line>
				);
			})}
		</group>
	);
}

function BackgroundDust({ progress }: ProgressRef) {
	const ref = useRef<THREE.Points>(null);

	const { positions, phases } = useMemo(() => {
		const count = 180;
		const pos = new Float32Array(count * 3);
		const ph = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			const theta = (i / count) * Math.PI * 2 * 3.1;
			const r = 1.8 + (i % 9) * 0.28;
			const y = ((i % 11) - 5) * 0.26;
			pos[i * 3]     = Math.cos(theta) * r;
			pos[i * 3 + 1] = y;
			pos[i * 3 + 2] = Math.sin(theta) * r;
			ph[i] = i * 0.23;
		}
		return { positions: pos, phases: ph };
	}, []);

	useFrame((state) => {
		if (!ref.current) return;
		const p = progress.current;
		const t = state.clock.elapsedTime;
		const active = smoothstep(0.1, 0.65, p);

		const geo = ref.current.geometry;
		const pos = geo.attributes.position as THREE.BufferAttribute;

		for (let i = 0; i < pos.count; i++) {
			const x0 = positions[i * 3];
			const y0 = positions[i * 3 + 1];
			const z0 = positions[i * 3 + 2];
			const sway = Math.sin(phases[i] + t * 0.8 + i * 0.02) * 0.025;
			pos.setXYZ(i, x0 + sway, y0 + sway * 0.6, z0 - sway * 0.5);
		}
		pos.needsUpdate = true;

		const mat = ref.current.material as THREE.PointsMaterial;
		mat.opacity = active * 0.13;
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
				size={0.016}
				sizeAttenuation
				transparent
				opacity={0}
				depthWrite={false}
			/>
		</points>
	);
}
