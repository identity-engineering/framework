import { useEffect, useMemo, useRef, useState } from 'react';
import { smoothstep } from './mono';

type CollectiveNode = {
	key: string;
	source: { x: number; y: number };
	target: { x: number; y: number };
	size: number;
	phase: number;
	cluster: number;
};

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function mixPoint(source: { x: number; y: number }, target: { x: number; y: number }, t: number) {
	return {
		x: lerp(source.x, target.x, t),
		y: lerp(source.y, target.y, t),
	};
}

export default function EmergenceScene() {
	const rootRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let frame = 0;

		const update = () => {
			frame = 0;
			const root = rootRef.current;
			if (!root) return;
			const track =
				(root.closest('[data-concept-section]') as HTMLElement | null) ??
				(root.parentElement as HTMLElement | null) ??
				root;
			const rect = track.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			const start = vh;
			const end = -Math.max(rect.height, 1);
			const raw = (start - rect.top) / (start - end);
			setProgress(clamp01(raw));
		};

		const schedule = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};

		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);

		return () => {
			if (frame) window.cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		};
	}, []);

	const nodes = useMemo<CollectiveNode[]>(() => {
		const total = 42;
		const clusterAnchors = [
			{ x: 26, y: 38 },
			{ x: 74, y: 38 },
			{ x: 50, y: 70 },
		];
		const shellRadius = 15.8;

		return Array.from({ length: total }, (_, i) => {
			const cluster = i % clusterAnchors.length;
			const anchor = clusterAnchors[cluster];
			const phase = i * 0.41;
			const spread = 5.5 + (i % 5) * 0.8;
			const source = {
				x: anchor.x + Math.cos(phase * 1.5) * spread,
				y: anchor.y + Math.sin(phase * 2.1) * spread * 0.72,
			};

			const golden = i * 2.399963229728653;
			const y = (i / (total - 1)) * 2 - 1;
			const radial = Math.sqrt(Math.max(0, 1 - y * y));
			const target = {
				x: 50 + Math.cos(golden) * radial * shellRadius,
				y: 50 + y * shellRadius * 0.88,
			};

			return {
				key: `node-${i}`,
				source,
				target,
				size: 1.05 + (i % 4) * 0.24,
				phase,
				cluster,
			};
		});
	}, []);

	const gather = smoothstep(0.1, 0.62, progress);
	const settle = smoothstep(0.5, 0.95, progress);
	const shellScale = 0.28 + gather * 0.62 + settle * 0.26;
	const coreScale = 0.3 + gather * 0.56 + settle * 0.38;
	const shellOpacity = 0.03 + settle * 0.08;
	const coreOpacity = 0.18 + gather * 0.22 + settle * 0.14;

	return (
		<div
			ref={rootRef}
			className="emergence-scene"
			data-progress={progress.toFixed(3)}
		>
			<style>{`
				.emergence-scene {
					position: absolute;
					inset: 0;
					overflow: hidden;
					background:
						radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), rgba(8,8,12,0.98) 58%),
						linear-gradient(180deg, rgba(255,255,255,0.04), rgba(8,8,12,0.98));
				}
				.emergence-scene::after {
					content: '';
					position: absolute;
					inset: 0;
					pointer-events: none;
					background: radial-gradient(circle at 50% 50%, transparent 0 42%, rgba(8,8,12,0.22) 100%);
				}
				.emergence-svg {
					position: absolute;
					inset: 0;
					width: 100%;
					height: 100%;
				}
				.emergence-label {
					position: absolute;
					right: 12px;
					bottom: 10px;
					color: rgba(245, 245, 245, 0.38);
					font-size: 10px;
					letter-spacing: 0.18em;
					text-transform: uppercase;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
				}
			`}</style>

			<svg className="emergence-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
				<defs>
					<radialGradient id="emergence-core" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="rgba(255,255,255,1)" />
						<stop offset="24%" stopColor="rgba(248,248,248,0.92)" />
						<stop offset="48%" stopColor="rgba(245,245,245,0.35)" />
						<stop offset="100%" stopColor="rgba(8,8,12,0)" />
					</radialGradient>
					<radialGradient id="emergence-shell" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="rgba(255,255,255,0)" />
						<stop offset="65%" stopColor="rgba(255,255,255,0.1)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
					</radialGradient>
					<linearGradient id="emergence-line" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
						<stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
					</linearGradient>
					<filter id="emergence-blur" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="1.2" />
					</filter>
				</defs>

				<circle cx="50" cy="50" r={12 + shellScale * 10.5} fill="none" stroke="url(#emergence-shell)" strokeWidth="0.35" opacity={shellOpacity} />
					<circle cx="50" cy="50" r={4.8 + coreScale * 2.8} fill="url(#emergence-core)" opacity={coreOpacity} filter="url(#emergence-blur)" />
					<circle cx="50" cy="50" r={2.1 + coreScale * 0.9} fill="rgba(255,255,255,0.98)" opacity={0.98} />
					<circle cx="50" cy="50" r={11.4 + shellScale * 5.8} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.16" opacity={0.16 + settle * 0.24} />
					<circle cx="50" cy="50" r={17.8 + shellScale * 7.2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.12" opacity={0.08 + settle * 0.08} />

				{nodes.map((node, index) => {
					const nodeCohere = smoothstep(0.1 + index * 0.004, 0.72, progress);
					const current = mixPoint(node.source, node.target, nodeCohere);
					const ringPull = 1 - settle * 0.18;
					const wobble = Math.sin(progress * Math.PI * 2.8 + node.phase) * (1 - settle) * 1.2;
					const x = lerp(current.x, 50 + (current.x - 50) * ringPull, 0.08) + Math.cos(node.phase * 1.7) * wobble;
					const y = lerp(current.y, 50 + (current.y - 50) * ringPull, 0.08) + Math.sin(node.phase * 2.1) * wobble * 0.72;
					const bridgeOpacity = 0.03 + nodeCohere * 0.16 + settle * 0.08;
					const nodeOpacity = 0.34 + nodeCohere * 0.24 + settle * 0.06;
					const nodeSize = node.size * (0.45 + settle * 0.14);
					let nodeFill = 'rgba(212,212,216,0.82)';
					if (node.cluster === 0) {
						nodeFill = 'rgba(255,255,255,0.95)';
					} else if (node.cluster === 1) {
						nodeFill = 'rgba(245,245,245,0.9)';
					}

					return (
						<g key={node.key}>
							<line
								x1={x}
								y1={y}
								x2={50 + (x - 50) * 0.22}
								y2={50 + (y - 50) * 0.22}
								stroke="url(#emergence-line)"
								strokeWidth={0.05 + nodeCohere * 0.06}
								strokeOpacity={bridgeOpacity}
							/>
							<circle
								cx={x}
								cy={y}
								r={nodeSize}
								fill={nodeFill}
								stroke="rgba(255,255,255,0.22)"
								strokeWidth={0.08}
								opacity={nodeOpacity}
							/>
						</g>
					);
				})}

				{Array.from({ length: 16 }, (_, i) => {
					const theta = (i / 16) * Math.PI * 2 + progress * Math.PI * 0.35;
					const radius = 17.4 + settle * 2.2;
					const p = {
						x: 50 + Math.cos(theta) * radius,
						y: 50 + Math.sin(theta) * radius * 0.62,
					};
					return (
						<circle
							key={`halo-${i}`}
							cx={p.x}
							cy={p.y}
							r={0.45 + settle * 0.2}
							fill="rgba(255,255,255,0.92)"
							opacity={0.16 + settle * 0.46}
						/>
					);
				})}
			</svg>

			<div className="emergence-label" aria-hidden="true"></div>
		</div>
	);
}
