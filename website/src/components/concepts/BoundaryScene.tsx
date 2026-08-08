import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

type ProgressRef = Readonly<{ progress: MutableRefObject<number> }>;

const LIPID_COUNT = 16;
const MEMBRANE_START = -2.55;
const MEMBRANE_END = 2.55;

interface Lipid {
	outer: THREE.Vector3;
	inner: THREE.Vector3;
}

interface MembraneGeometry {
	lipids: Lipid[];
	tails: THREE.BufferGeometry[];
	leaflets: THREE.BufferGeometry[];
}

export default function BoundaryScene() {
	const progress = useRef(0);

	return (
		<div className="w-full h-full">
			<ConceptCanvas camera={{ position: [0, 0.1, 5.6], fov: 38 }} fogFar={12}>
				<ScrollProgressController progress={progress} />
				<Membrane progress={progress} />
				<ExchangeParticles progress={progress} />
			</ConceptCanvas>
		</div>
	);
}

function buildMembraneGeometry(): MembraneGeometry {
	const lipids: Lipid[] = [];
	const tails: THREE.BufferGeometry[] = [];
	const outerPoints: THREE.Vector3[] = [];
	const innerPoints: THREE.Vector3[] = [];

	for (let i = 0; i < LIPID_COUNT; i++) {
		const t = i / (LIPID_COUNT - 1);
		const x = THREE.MathUtils.lerp(MEMBRANE_START, MEMBRANE_END, t);
		const curveY = Math.sin(x * 0.9) * 0.1;
		const curveZ = Math.sin(x * 0.65) * 0.18;
		const outer = new THREE.Vector3(x, curveY + 0.3, curveZ);
		const inner = new THREE.Vector3(x, curveY - 0.3, curveZ);
		const midline = new THREE.Vector3(x, curveY, curveZ);

		lipids.push({ outer, inner });
		outerPoints.push(outer);
		innerPoints.push(inner);

		for (const offset of [-0.045, 0.045]) {
			tails.push(
				new THREE.BufferGeometry().setFromPoints([
					outer.clone().add(new THREE.Vector3(0, -0.08, offset)),
					outer.clone().lerp(midline, 0.52).add(new THREE.Vector3(offset * 0.35, -0.015, offset * 0.7)),
					midline.clone().add(new THREE.Vector3(offset, 0.025, offset * 0.45)),
				]),
			);
			tails.push(
				new THREE.BufferGeometry().setFromPoints([
					inner.clone().add(new THREE.Vector3(0, 0.08, -offset)),
					inner.clone().lerp(midline, 0.52).add(new THREE.Vector3(offset * 0.35, 0.015, -offset * 0.7)),
					midline.clone().add(new THREE.Vector3(offset, -0.025, -offset * 0.45)),
				]),
			);
		}
	}

	return {
		lipids,
		tails,
		leaflets: [
			new THREE.BufferGeometry().setFromPoints(outerPoints),
			new THREE.BufferGeometry().setFromPoints(innerPoints),
		],
	};
}

function Membrane({ progress }: ProgressRef) {
	const rootRef = useRef<THREE.Group>(null);
	const leafletMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
	const tailMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
	const headMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
	const data = useMemo(() => buildMembraneGeometry(), []);

	useFrame(() => {
		const p = progress.current;
		const reveal = smoothstep(0.03, 0.48, p);

		if (rootRef.current) {
			const spread = 0.12 + reveal * 0.88;
			rootRef.current.scale.set(spread, spread, spread);
			rootRef.current.rotation.y = (p - 0.5) * 0.16;
			rootRef.current.rotation.z = (p - 0.5) * 0.025;
		}

		leafletMats.current.forEach((material) => {
			if (material) material.opacity = reveal * 0.22;
		});

		tailMats.current.forEach((material, index) => {
			if (!material) return;
			const lipidIndex = Math.floor(index / 4);
			const lipidReveal = smoothstep(
				0.12 + (lipidIndex / LIPID_COUNT) * 0.18,
				0.38 + (lipidIndex / LIPID_COUNT) * 0.18,
				p,
			);
			material.opacity = lipidReveal * 0.3;
		});

		headMats.current.forEach((material, index) => {
			if (!material) return;
			const lipidIndex = Math.floor(index / 2);
			const lipidReveal = smoothstep(
				0.08 + (lipidIndex / LIPID_COUNT) * 0.18,
				0.3 + (lipidIndex / LIPID_COUNT) * 0.18,
				p,
			);
			material.opacity = lipidReveal * (index % 2 === 0 ? 0.78 : 0.6);
		});
	});

	return (
		<group ref={rootRef}>
			{data.leaflets.map((geometry, index) => (
				<line key={`leaflet-${index}`} geometry={geometry}>
					<lineBasicMaterial
						ref={(material) => {
							leafletMats.current[index] = material;
						}}
						color={index === 0 ? mono.white : mono.high}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</line>
			))}
			{data.tails.map((geometry, index) => (
				<line key={`tail-${index}`} geometry={geometry}>
					<lineBasicMaterial
						ref={(material) => {
							tailMats.current[index] = material;
						}}
						color={index % 4 < 2 ? mono.high : mono.mid}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</line>
			))}
			{data.lipids.map((lipid, index) => (
				<group key={`lipid-${index}`}>
					<mesh position={lipid.outer}>
						<icosahedronGeometry args={[0.085, 1]} />
						<meshBasicMaterial
							ref={(material) => {
							headMats.current[index * 2] = material;
							}}
							color={mono.white}
							transparent
							opacity={0}
							wireframe
							depthWrite={false}
						/>
					</mesh>
					<mesh position={lipid.inner}>
						<icosahedronGeometry args={[0.085, 1]} />
						<meshBasicMaterial
							ref={(material) => {
								headMats.current[index * 2 + 1] = material;
							}}
							color={mono.high}
							transparent
							opacity={0}
							wireframe
							depthWrite={false}
						/>
					</mesh>
				</group>
			))}
		</group>
	);
}

interface ParticleStream {
	kind: 'allowed' | 'blocked';
	start: THREE.Vector3;
	gate: THREE.Vector3;
	end: THREE.Vector3;
	size: number;
	delay: number;
}

function buildParticleStreams(): ParticleStream[] {
	return [
		{ kind: 'allowed', start: new THREE.Vector3(-2.05, 1.3, 0.18), gate: new THREE.Vector3(-2.05, 0, 0.18), end: new THREE.Vector3(-1.92, -1.2, 0.14), size: 0.052, delay: 0.2 },
		{ kind: 'blocked', start: new THREE.Vector3(-1.62, 1.45, -0.16), gate: new THREE.Vector3(-1.62, 0.42, -0.16), end: new THREE.Vector3(-1.98, 0.62, -0.1), size: 0.045, delay: 0.25 },
		{ kind: 'allowed', start: new THREE.Vector3(-1.08, 1.18, 0.32), gate: new THREE.Vector3(-1.08, 0, 0.32), end: new THREE.Vector3(-0.96, -1.18, 0.28), size: 0.045, delay: 0.28 },
		{ kind: 'blocked', start: new THREE.Vector3(-0.58, 1.42, -0.22), gate: new THREE.Vector3(-0.58, 0.43, -0.22), end: new THREE.Vector3(-0.22, 0.62, -0.18), size: 0.058, delay: 0.33 },
		{ kind: 'allowed', start: new THREE.Vector3(-0.18, 1.32, 0.22), gate: new THREE.Vector3(-0.18, 0, 0.22), end: new THREE.Vector3(-0.08, -1.28, 0.18), size: 0.04, delay: 0.36 },
		{ kind: 'blocked', start: new THREE.Vector3(0.38, 1.2, -0.18), gate: new THREE.Vector3(0.38, 0.44, -0.18), end: new THREE.Vector3(0.72, 0.62, -0.12), size: 0.048, delay: 0.4 },
		{ kind: 'allowed', start: new THREE.Vector3(0.78, 1.48, 0.28), gate: new THREE.Vector3(0.78, 0, 0.28), end: new THREE.Vector3(0.9, -1.16, 0.22), size: 0.056, delay: 0.43 },
		{ kind: 'blocked', start: new THREE.Vector3(1.22, 1.28, -0.24), gate: new THREE.Vector3(1.22, 0.43, -0.24), end: new THREE.Vector3(0.9, 0.62, -0.18), size: 0.043, delay: 0.47 },
		{ kind: 'allowed', start: new THREE.Vector3(1.62, 1.38, 0.16), gate: new THREE.Vector3(1.62, 0, 0.16), end: new THREE.Vector3(1.74, -1.22, 0.1), size: 0.047, delay: 0.5 },
		{ kind: 'blocked', start: new THREE.Vector3(2.08, 1.18, -0.12), gate: new THREE.Vector3(2.08, 0.44, -0.12), end: new THREE.Vector3(1.7, 0.64, -0.06), size: 0.052, delay: 0.54 },
	];
}

function ExchangeParticles({ progress }: ProgressRef) {
	const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
	const particleMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
	const pathMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
	const streams = useMemo(() => buildParticleStreams(), []);
	const pathGeometries = useMemo(
		() =>
			streams.map((stream) => {
				const curve = new THREE.CatmullRomCurve3([stream.start, stream.gate, stream.end]);
				return new THREE.BufferGeometry().setFromPoints(curve.getPoints(18));
			}),
		[streams],
	);

	useFrame(() => {
		const p = progress.current;

		streams.forEach((stream, index) => {
			const particle = particleRefs.current[index];
			const material = particleMats.current[index];
			const pathMaterial = pathMats.current[index];
			if (!particle || !material) return;

			const reveal = smoothstep(stream.delay, stream.delay + 0.16, p);
			const travel = smoothstep(stream.delay + 0.08, stream.delay + 0.62, p);
			if (stream.kind === 'allowed') {
				particle.position.lerpVectors(stream.start, stream.end, travel);
				material.opacity = reveal * 0.72;
			} else {
				const approach = smoothstep(stream.delay + 0.08, stream.delay + 0.42, p);
				const deflect = smoothstep(stream.delay + 0.42, stream.delay + 0.68, p);
				if (deflect > 0) {
					particle.position.lerpVectors(stream.gate, stream.end, deflect);
				} else {
					particle.position.lerpVectors(stream.start, stream.gate, approach);
				}
				material.opacity = reveal * 0.42;
			}
			if (pathMaterial) {
				pathMaterial.opacity = smoothstep(0.18, 0.52, p) * (stream.kind === 'allowed' ? 0.1 : 0.055);
			}
		});
	});

	return (
		<group>
			{streams.map((stream, index) => (
				<line key={`path-${index}`} geometry={pathGeometries[index]}>
					<lineBasicMaterial
						ref={(material) => {
							pathMats.current[index] = material;
						}}
						color={stream.kind === 'allowed' ? mono.white : mono.low}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</line>
			))}
			{streams.map((stream, index) => (
				<mesh
					key={`particle-${index}`}
					ref={(mesh) => {
						particleRefs.current[index] = mesh;
					}}
					position={stream.start}
				>
					<icosahedronGeometry args={[stream.size, 1]} />
					<meshBasicMaterial
						ref={(material) => {
							particleMats.current[index] = material;
						}}
						color={stream.kind === 'allowed' ? mono.white : mono.low}
						transparent
						opacity={0}
						wireframe
						depthWrite={false}
					/>
				</mesh>
			))}
		</group>
	);
}
