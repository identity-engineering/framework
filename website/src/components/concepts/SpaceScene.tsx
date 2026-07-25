import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

/**
 * Space — relational order of positions. Dots appear; relative distances become visible.
 */
export default function SpaceScene() {
	const progress = useRef(0);

	return (
		<div className="w-full h-full">
			<ConceptCanvas camera={{ position: [0, 0.8, 5.2], fov: 48 }}>
				<ScrollProgressController progress={progress} />
				<RelationalField progress={progress} />
				<PositionDots progress={progress} />
			</ConceptCanvas>
		</div>
	);
}

function PositionDots({ progress }: { progress: React.MutableRefObject<number> }) {
	const groupRef = useRef<THREE.Group>(null);

	const dots = useMemo(() => {
		const arr: { pos: THREE.Vector3; size: number; phase: number }[] = [];
		for (let i = 0; i < 24; i++) {
			const theta = (i / 24) * Math.PI * 2 + (i % 5) * 0.15;
			const phi = ((i % 7) - 3) * 0.22;
			const r = 0.6 + (i % 6) * 0.35;
			arr.push({
				pos: new THREE.Vector3(
					Math.cos(theta) * r * Math.cos(phi),
					Math.sin(phi) * 1.4,
					Math.sin(theta) * r * Math.cos(phi),
				),
				size: 0.028 + (i % 4) * 0.012,
				phase: i / 24,
			});
		}
		return arr;
	}, []);

	useFrame(() => {
		if (!groupRef.current) return;
		const p = progress.current;
		const appear = smoothstep(0.02, 0.35, p);
		groupRef.current.rotation.y = p * Math.PI * 0.55;
		groupRef.current.children.forEach((child, i) => {
			const d = dots[i];
			if (!d) return;
			const local = smoothstep(d.phase * 0.4, d.phase * 0.4 + 0.25, p);
			child.scale.setScalar((0.35 + local * 0.75) * appear);
			const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
			if (mat) mat.emissiveIntensity = 0.35 + local * 1.1 * appear;
		});
	});

	return (
		<group ref={groupRef}>
			{dots.map((d, i) => (
				<mesh key={i} position={d.pos}>
					<sphereGeometry args={[d.size, 12, 12]} />
					<meshStandardMaterial
						color={mono.high}
						emissive={mono.white}
						emissiveIntensity={0.5}
						roughness={0.35}
					/>
				</mesh>
			))}
		</group>
	);
}

function RelationalField({ progress }: { progress: React.MutableRefObject<number> }) {
	const ref = useRef<THREE.Group>(null);

	const edges = useMemo(() => {
		const pts: THREE.Vector3[] = [];
		for (let i = 0; i < 16; i++) {
			const theta = (i / 16) * Math.PI * 2;
			const r = 1.15 + (i % 4) * 0.35;
			pts.push(
				new THREE.Vector3(
					Math.cos(theta) * r,
					((i % 5) - 2) * 0.35,
					Math.sin(theta) * r,
				),
			);
		}
		const lines: [THREE.Vector3, THREE.Vector3][] = [];
		for (let i = 0; i < pts.length; i++) {
			for (let j = i + 1; j < pts.length; j++) {
				if (pts[i].distanceTo(pts[j]) < 2.0) lines.push([pts[i], pts[j]]);
			}
		}
		return lines;
	}, []);

	useFrame(() => {
		if (!ref.current) return;
		const p = progress.current;
		const active = smoothstep(0.15, 0.55, p);
		ref.current.rotation.y = -p * Math.PI * 0.35;
		ref.current.children.forEach((child) => {
			const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
			if (mat) mat.opacity = 0.02 + active * 0.18;
		});
	});

	return (
		<group ref={ref}>
			{edges.map(([a, b], i) => {
				const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
				return (
					<line key={i} geometry={geometry}>
						<lineBasicMaterial
							color={mono.mid}
							transparent
							opacity={0.08}
							depthWrite={false}
						/>
					</line>
				);
			})}
		</group>
	);
}
