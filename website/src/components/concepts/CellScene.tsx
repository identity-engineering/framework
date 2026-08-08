import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConceptCanvas from './ConceptCanvas';
import ScrollProgressController from './ScrollProgressController';
import { smoothstep } from './mono';

type ProgressRef = Readonly<{ progress: MutableRefObject<number> }>;

const PARTICLE_COUNT = 10;

const cellPalette = {
	membrane: '#7895b0',
	membraneHighlight: '#edf4fa',
	nucleusEdge: '#e8d18d',
	organelle: '#708aa3',
	organelleHighlight: '#c6d5e1',
	particle: '#eef5f8',
	accent: '#d5e2ea',
} as const;

type VectorTuple = [number, number, number];

interface MitochondrionLayout {
	position: VectorTuple;
	scale: VectorTuple;
	rotation: number;
}

interface CellGeometry {
	membraneWire: THREE.WireframeGeometry;
	innerMembraneWire: THREE.WireframeGeometry;
	nucleusWire: THREE.WireframeGeometry;
	nucleusCoreRing: THREE.WireframeGeometry;
	mitochondrionWire: THREE.WireframeGeometry;
	mitochondrionFold: THREE.BufferGeometry;
	golgiWire: THREE.WireframeGeometry;
	erGeometries: THREE.BufferGeometry[];
	flowCurves: THREE.CatmullRomCurve3[];
	flowGeometries: THREE.BufferGeometry[];
	vesicle: THREE.SphereGeometry;
	ribosome: THREE.IcosahedronGeometry;
}

const mitochondria: MitochondrionLayout[] = [
	{ position: [-0.9, 0.38, 0.42], scale: [1.15, 0.72, 0.72], rotation: -0.35 },
	{ position: [0.88, 0.42, 0.28], scale: [0.95, 0.68, 0.68], rotation: 0.3 },
	{ position: [-0.84, -0.42, 0.36], scale: [0.9, 0.65, 0.65], rotation: 0.22 },
	{ position: [0.82, -0.38, 0.42], scale: [1.12, 0.7, 0.7], rotation: -0.22 },
];

const vesiclePositions: VectorTuple[] = [
	[-1.02, 0.02, 0.34],
	[1.02, -0.04, 0.3],
	[-0.42, 0.72, 0.3],
	[0.44, 0.7, 0.28],
];

const ribosomePositions: VectorTuple[] = [
	[-1.05, 0.62, 0.08],
	[-0.7, 0.7, 0.1],
	[-0.4, -0.72, 0.08],
	[0.78, 0.68, 0.06],
	[1.08, 0.3, 0.08],
	[1.04, -0.58, 0.12],
	[-1.08, -0.58, 0.06],
];

export default function CellScene() {
	const progress = useRef(0);

	return (
		<div className="w-full h-full">
			<ConceptCanvas camera={{ position: [0, 0, 4.7], fov: 38 }} fogFar={8}>
				<ScrollProgressController progress={progress} />
				<CellForm progress={progress} />
			</ConceptCanvas>
		</div>
	);
}

function wireframeOnlyFrom(geometry: THREE.BufferGeometry): THREE.WireframeGeometry {
	const wireframe = new THREE.WireframeGeometry(geometry);
	geometry.dispose();
	return wireframe;
}

function buildCellGeometry(): CellGeometry {
	const membraneWire = wireframeOnlyFrom(new THREE.SphereGeometry(1.3, 32, 18));
	const innerMembraneWire = wireframeOnlyFrom(new THREE.SphereGeometry(1.18, 24, 14));
	const nucleusWire = wireframeOnlyFrom(new THREE.SphereGeometry(0.58, 24, 14));
	const nucleusCoreRingGeometry = new THREE.TorusGeometry(0.28, 0.018, 6, 24);
	const nucleusCoreRing = wireframeOnlyFrom(nucleusCoreRingGeometry);

	const mitochondrionCurve = new THREE.CatmullRomCurve3([
		new THREE.Vector3(-0.22, 0, 0),
		new THREE.Vector3(-0.04, 0.13, 0),
		new THREE.Vector3(0.22, 0, 0),
	]);
	const mitochondrion = new THREE.TubeGeometry(mitochondrionCurve, 14, 0.055, 8, false);
	const mitochondrionWire = wireframeOnlyFrom(mitochondrion);
	const mitochondrionFold = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(-0.15, 0.025, 0.058),
		new THREE.Vector3(-0.04, 0.08, 0.058),
		new THREE.Vector3(0.08, 0.025, 0.058),
		new THREE.Vector3(0.16, -0.01, 0.058),
	]);

	const golgiSlice = new THREE.BoxGeometry(0.46, 0.055, 0.14);
	const golgiWire = wireframeOnlyFrom(golgiSlice);
	const erPointSets: THREE.Vector3[][] = [
		[
			new THREE.Vector3(-0.92, 0.7, -0.08),
			new THREE.Vector3(-0.6, 0.82, -0.06),
			new THREE.Vector3(-0.28, 0.7, -0.04),
			new THREE.Vector3(-0.08, 0.58, -0.02),
		],
		[
			new THREE.Vector3(0.14, 0.66, -0.06),
			new THREE.Vector3(0.42, 0.78, -0.04),
			new THREE.Vector3(0.76, 0.68, -0.02),
			new THREE.Vector3(1.0, 0.52, 0),
		],
	];
	const erGeometries = erPointSets.map((points) => {
		const curve = new THREE.CatmullRomCurve3(points);
		return new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
	});

	const flowPoints: THREE.Vector3[][] = [
		[
			new THREE.Vector3(-1.08, 0.3, 0.12),
			new THREE.Vector3(-0.72, 0.38, 0.2),
			new THREE.Vector3(-0.34, 0.22, 0.3),
			new THREE.Vector3(0.02, 0.02, 0.38),
			new THREE.Vector3(0.42, -0.18, 0.28),
			new THREE.Vector3(0.74, -0.3, 0.18),
			new THREE.Vector3(1.08, -0.18, 0.12),
		],
		[
			new THREE.Vector3(1.08, 0.34, -0.08),
			new THREE.Vector3(0.72, 0.22, 0.02),
			new THREE.Vector3(0.36, 0.08, 0.16),
			new THREE.Vector3(0.02, 0.22, 0.26),
			new THREE.Vector3(-0.36, 0.12, 0.2),
			new THREE.Vector3(-0.72, -0.08, 0.08),
			new THREE.Vector3(-1.08, 0.12, -0.02),
		],
	];
	const flowCurves = flowPoints.map((points) => new THREE.CatmullRomCurve3(points));
	const flowGeometries = flowCurves.map((curve) =>
		new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),
	);

	return {
		membraneWire,
		innerMembraneWire,
		nucleusWire,
		nucleusCoreRing,
		mitochondrionWire,
		mitochondrionFold,
		golgiWire,
		erGeometries,
		flowCurves,
		flowGeometries,
		vesicle: new THREE.SphereGeometry(0.06, 16, 10),
		ribosome: new THREE.IcosahedronGeometry(0.045, 1),
	};
}

function setOpacity(object: THREE.Object3D | null, opacity: number) {
	if (!object) return;

	object.traverse((child) => {
		const material = (child as THREE.Mesh).material;
		if (!material || Array.isArray(material)) return;
		material.opacity = opacity;
	});
}

function CellForm({ progress }: ProgressRef) {
	const rootRef = useRef<THREE.Group>(null);
	const membraneRef = useRef<THREE.Group>(null);
	const innerMembraneRef = useRef<THREE.Group>(null);
	const nucleusRef = useRef<THREE.Group>(null);
	const organellesRef = useRef<THREE.Group>(null);
	const flowRef = useRef<THREE.Group>(null);
	const particleRef = useRef<THREE.Group>(null);
	const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
	const data = useMemo(() => buildCellGeometry(), []);

	useFrame(() => {
		const scrollProgress = progress.current;
		const membraneReveal = smoothstep(0.02, 0.32, scrollProgress);
		const nucleusReveal = smoothstep(0.24, 0.52, scrollProgress);
		const organelleReveal = smoothstep(0.45, 0.72, scrollProgress);
		const motionReveal = smoothstep(0.62, 0.9, scrollProgress);

		if (rootRef.current) {
			rootRef.current.rotation.y = (scrollProgress - 0.2) * Math.PI * 0.42;
			rootRef.current.rotation.x = (scrollProgress - 0.5) * 0.08;
		}
		if (membraneRef.current) {
			const assembly = 0.32 + membraneReveal * 0.68;
			membraneRef.current.scale.set(assembly * 1.35, assembly * 0.88, assembly * 0.92);
		}
		if (innerMembraneRef.current) {
			const assembly = 0.28 + membraneReveal * 0.72;
			innerMembraneRef.current.scale.set(assembly * 1.24, assembly * 0.8, assembly * 0.84);
		}
		setOpacity(membraneRef.current, membraneReveal * 0.38);
		setOpacity(innerMembraneRef.current, membraneReveal * 0.14);

		if (nucleusRef.current) {
			const pulse = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.035 * nucleusReveal;
			nucleusRef.current.scale.setScalar((0.2 + nucleusReveal * 0.8) * pulse);
			nucleusRef.current.rotation.y = scrollProgress * Math.PI * 0.8;
		}
		setOpacity(nucleusRef.current, nucleusReveal * 0.62);

		if (organellesRef.current) {
			const assembly = 0.3 + organelleReveal * 0.7;
			organellesRef.current.scale.setScalar(assembly);
			organellesRef.current.rotation.z = (scrollProgress - 0.5) * 0.08;
		}
		setOpacity(organellesRef.current, organelleReveal * 0.54);
		setOpacity(flowRef.current, motionReveal * 0.16);
		setOpacity(particleRef.current, motionReveal * 0.58);

		particleRefs.current.forEach((particle, particleIndex) => {
			const flow = data.flowCurves[particleIndex % data.flowCurves.length];
			const localProgress = (scrollProgress * 1.15 + (particleIndex / PARTICLE_COUNT) * 0.88) % 1;
			if (particle) {
				particle.position.copy(flow.getPointAt(localProgress));
				particle.scale.setScalar(0.7 + motionReveal * 0.3);
			}
		});
	});

	return (
		<group ref={rootRef}>
			<group ref={membraneRef}>
				<lineSegments geometry={data.membraneWire} scale={[1.35, 0.88, 0.92]}>
					<lineBasicMaterial
						color={cellPalette.membraneHighlight}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</lineSegments>
			</group>
			<group ref={innerMembraneRef}>
				<lineSegments geometry={data.innerMembraneWire} scale={[1.24, 0.8, 0.84]}>
					<lineBasicMaterial
						color={cellPalette.membrane}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</lineSegments>
			</group>
			<group ref={nucleusRef} position={[0, 0.12, 0.42]}>
				<lineSegments geometry={data.nucleusWire} scale={[1.25, 0.84, 0.9]}>
					<lineBasicMaterial
						color={cellPalette.nucleusEdge}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</lineSegments>
				<lineSegments geometry={data.nucleusCoreRing} position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
					<lineBasicMaterial
						color={cellPalette.nucleusEdge}
						transparent
						opacity={0}
						depthWrite={false}
					/>
				</lineSegments>
			</group>
			<group ref={organellesRef}>
				{data.erGeometries.map((geometry, index) => (
					<line key={`er-${index}`} geometry={geometry}>
						<lineBasicMaterial
							color={cellPalette.organelleHighlight}
							transparent
							opacity={0}
							depthWrite={false}
						/>
					</line>
				))}
				{mitochondria.map((layout, index) => (
					<group key={`mitochondrion-${index}`} position={layout.position} scale={layout.scale} rotation={[0, 0, layout.rotation]}>
						<lineSegments geometry={data.mitochondrionWire}>
							<lineBasicMaterial
								color={cellPalette.organelleHighlight}
								transparent
								opacity={0}
								depthWrite={false}
							/>
						</lineSegments>
						<line geometry={data.mitochondrionFold}>
							<lineBasicMaterial
								color={cellPalette.accent}
								transparent
								opacity={0}
								depthWrite={false}
							/>
						</line>
					</group>
				))}
				<group position={[-0.48, -0.4, 0.46]} rotation={[0, 0, -0.16]}>
					{Array.from({ length: 5 }, (_, sliceIndex) => (
						<group key={`golgi-${sliceIndex}`} position={[0, (sliceIndex - 2) * 0.075, sliceIndex * 0.018]} scale={[1 - Math.abs(sliceIndex - 2) * 0.1, 1, 1]}>
							<lineSegments geometry={data.golgiWire}>
								<lineBasicMaterial
									color={cellPalette.organelleHighlight}
									transparent
									opacity={0}
									depthWrite={false}
								/>
							</lineSegments>
						</group>
					))}
				</group>
				{vesiclePositions.map((position, index) => (
					<mesh key={`vesicle-${index}`} geometry={data.vesicle} position={position} scale={index % 2 === 0 ? 1.1 : 0.8}>
						<meshBasicMaterial
							color={index % 2 === 0 ? cellPalette.accent : cellPalette.organelleHighlight}
							transparent
							opacity={0}
							wireframe
							depthWrite={false}
						/>
					</mesh>
				))}
				{ribosomePositions.map((position, index) => (
					<mesh key={`ribosome-${index}`} geometry={data.ribosome} position={position} scale={index % 3 === 0 ? 1.15 : 0.8}>
						<meshBasicMaterial
							color={cellPalette.particle}
							transparent
							opacity={0}
							wireframe
							depthWrite={false}
						/>
					</mesh>
				))}
			</group>
			<group ref={flowRef}>
				{data.flowGeometries.map((geometry, index) => (
					<line key={`flow-${index}`} geometry={geometry}>
						<lineBasicMaterial
							color={index === 1 ? cellPalette.nucleusEdge : cellPalette.particle}
							transparent
							opacity={0}
							depthWrite={false}
						/>
					</line>
				))}
			</group>
			<group ref={particleRef}>
				{Array.from({ length: PARTICLE_COUNT }, (_, particleIndex) => {
					const flow = data.flowCurves[particleIndex % data.flowCurves.length];
					return (
						<mesh
							key={`particle-${particleIndex}`}
							ref={(mesh) => {
								particleRefs.current[particleIndex] = mesh;
							}}
							geometry={data.ribosome}
							position={flow.getPointAt(0)}
							scale={0.72 + (particleIndex % 3) * 0.12}
						>
							<meshBasicMaterial
								color={particleIndex % 4 === 0 ? cellPalette.accent : cellPalette.particle}
								transparent
								opacity={0}
								wireframe
								depthWrite={false}
							/>
						</mesh>
					);
				})}
			</group>
		</group>
	);
}