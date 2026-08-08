import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { mono, smoothstep } from './mono';

type ProgressRef = Readonly<{ progress: MutableRefObject<number> }>;

const Y0 = -2.4;
const Y1 = 2.4;
const SEGMENTS = 88;
const RUNG_COUNT = 3;
const RUNG_START = 0.33;
const RUNG_END = 0.67;

interface GeneGeometry {
	strands: THREE.WireframeGeometry[];
	rungs: THREE.WireframeGeometry[];
}

export default function GeneScene() {
	const progress = useRef(0);

	return (
		<div className="w-full h-full">
			<ConceptCanvas camera={{ position: [0, 0, 3.5], fov: 32 }} fogFar={8}>
				<ScrollProgressController progress={progress} />
				<GeneHelix progress={progress} />
			</ConceptCanvas>
		</div>
	);
}

function buildGeneGeometry(): GeneGeometry {
	const strandPoints: THREE.Vector3[][] = [[], []];

	for (let strand = 0; strand < 2; strand++) {
		for (let i = 0; i <= SEGMENTS; i++) {
			const t = i / SEGMENTS;
			const angle = t * Math.PI * 3.3 + strand * Math.PI;
			const radius = 0.52 + Math.sin(t * Math.PI * 2) * 0.035;
			strandPoints[strand].push(
				new THREE.Vector3(
					Math.cos(angle) * radius,
					Y0 + t * (Y1 - Y0),
					Math.sin(angle) * radius,
				),
			);
		}
	}

	const curves = strandPoints.map((points) => new THREE.CatmullRomCurve3(points));
	const strands = curves.map((curve) => {
		const tube = new THREE.TubeGeometry(curve, SEGMENTS, 0.075, 8, false);
		const wireframe = new THREE.WireframeGeometry(tube);
		tube.dispose();
		return wireframe;
	});
	const rungs: THREE.WireframeGeometry[] = [];

	for (let i = 0; i < RUNG_COUNT; i++) {
		const t = RUNG_START + (i / (RUNG_COUNT - 1)) * (RUNG_END - RUNG_START);
		const index = Math.round(t * SEGMENTS);
		const rungCurve = new THREE.LineCurve3(strandPoints[0][index], strandPoints[1][index]);
		const tube = new THREE.TubeGeometry(rungCurve, 1, 0.045, 6, false);
		const wireframe = new THREE.WireframeGeometry(tube);
		tube.dispose();
		rungs.push(wireframe);
	}

	return { strands, rungs };
}

function GeneHelix({ progress }: ProgressRef) {
	const rootRef = useRef<THREE.Group>(null);
	const strandMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
	const rungMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
	const data = useMemo(() => buildGeneGeometry(), []);

	useFrame(() => {
		const p = progress.current;
		const reveal = smoothstep(0.02, 0.44, p);

		if (rootRef.current) {
			rootRef.current.scale.set(1.18, 0.12 + reveal * 0.88, 1.18);
			rootRef.current.rotation.y = p * Math.PI * 1.35;
			rootRef.current.rotation.z = (p - 0.5) * 0.06;
		}

		strandMats.current.forEach((material, index) => {
			if (material) material.opacity = reveal * (index === 0 ? 0.7 : 0.52);
		});

		const rungReveal = smoothstep(0.18, 0.7, p);
		rungMats.current.forEach((material, index) => {
			if (material) material.opacity = reveal * rungReveal * (index === 1 ? 0.48 : 0.34);
		});
	});

	return (
		<group ref={rootRef}>
			{data.strands.map((geometry, index) => (
				<lineSegments key={`strand-${index}`} geometry={geometry}>
					<lineBasicMaterial
						ref={(material) => {
							strandMats.current[index] = material;
						}}
						color={index === 0 ? mono.white : mono.high}
						transparent
						opacity={0}
						depthWrite={false}
						blending={THREE.AdditiveBlending}
					/>
				</lineSegments>
			))}
			{data.rungs.map((geometry, index) => (
				<lineSegments key={`rung-${index}`} geometry={geometry}>
					<lineBasicMaterial
						ref={(material) => {
							rungMats.current[index] = material;
						}}
						color={mono.mid}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</lineSegments>
			))}
		</group>
	);
}