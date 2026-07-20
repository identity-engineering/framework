import { useEffect, useMemo, useRef, useState } from 'react';
import { smoothstep } from './mono';

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function polar(radius: number, angle: number) {
	return {
		x: 50 + Math.cos(angle) * radius,
		y: 50 + Math.sin(angle) * radius,
	};
}

function buildDampedWavePath(
	radius: number,
	baseAmp: number,
	freqA: number,
	freqB: number,
	phase: number,
	damping: number,
	progress: number
) {
	const pts: string[] = [];
	const amp = baseAmp * (1 - damping * 0.85);
	const drift = progress * Math.PI * 2.2 + phase;

	for (let deg = 0; deg <= 360; deg += 7) {
		const t = (deg * Math.PI) / 180;
		const oscA = Math.sin(t * freqA + drift) * amp;
		const oscB = Math.sin(t * freqB - drift * 0.75) * amp * 0.52;
		const localR = radius + oscA + oscB;
		const p = polar(localR, t);
		pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
	}

	return `M ${pts.join(' L ')} Z`;
}

export default function DampingScene() {
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

	const damping = smoothstep(0.16, 0.9, progress);
	const coherence = smoothstep(0.42, 0.95, progress);

	const waves = useMemo(
		() => [
			{ key: 'w1', radius: 12.5, amp: 2.4, fa: 3.8, fb: 6.2, phase: 0.2, op: 0.34 },
			{ key: 'w2', radius: 16.8, amp: 2.8, fa: 4.3, fb: 7.1, phase: 0.9, op: 0.31 },
			{ key: 'w3', radius: 22.1, amp: 3.2, fa: 5.1, fb: 8.2, phase: 1.5, op: 0.29 },
			{ key: 'w4', radius: 28.4, amp: 3.6, fa: 5.8, fb: 9.0, phase: 2.2, op: 0.25 },
		],
		[]
	);

	const microParticles = useMemo(
		() =>
			Array.from({ length: 34 }, (_, i) => {
				const theta = (i / 34) * Math.PI * 2;
				return {
					key: `p-${i}`,
					theta,
					r: 10 + (i % 6) * 3.1,
					phase: i * 0.37,
				};
			}),
		[]
	);

	return (
		<div ref={rootRef} className="damping-scene" data-progress={progress.toFixed(3)}>
			<style>{`
				.damping-scene {
					position: absolute;
					inset: 0;
					overflow: hidden;
					background:
						radial-gradient(circle at 50% 42%, rgba(245,245,245,0.05), rgba(8,8,12,0.98) 60%),
						linear-gradient(180deg, rgba(245,245,245,0.03), rgba(8,8,12,0.97));
				}
				.damping-svg {
					position: absolute;
					inset: 0;
					width: 100%;
					height: 100%;
				}
			`}</style>

			<svg className="damping-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
				<defs>
					<radialGradient id="damp-core" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
						<stop offset="40%" stopColor="rgba(245,245,245,0.35)" />
						<stop offset="100%" stopColor="rgba(8,8,12,0)" />
					</radialGradient>
					<linearGradient id="damp-wave" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
						<stop offset="50%" stopColor="rgba(255,255,255,0.92)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
					</linearGradient>
				</defs>

				<circle cx="50" cy="50" r={3.2 + coherence * 0.9} fill="url(#damp-core)" opacity={0.74 + coherence * 0.18} />
				<circle cx="50" cy="50" r={1.05 + coherence * 0.34} fill="rgba(255,255,255,1)" opacity={0.98} />

				{waves.map((wave, idx) => {
					const path = buildDampedWavePath(
						wave.radius,
						wave.amp,
						wave.fa,
						wave.fb,
						wave.phase,
						damping,
						progress
					);
					const strokeOpacity = wave.op * (1 - damping * 0.42) + coherence * 0.08;
					const strokeWidth = 0.16 + idx * 0.02 - damping * 0.03;
					return (
						<path
							key={wave.key}
							d={path}
							fill="none"
							stroke="url(#damp-wave)"
							strokeWidth={strokeWidth}
							strokeOpacity={strokeOpacity}
						/>
					);
				})}

				{microParticles.map((particle, i) => {
					const settle = smoothstep(0.12 + i * 0.006, 0.9, progress);
					const theta = particle.theta + progress * (0.7 + (i % 5) * 0.05);
					const localR = particle.r + Math.sin(progress * Math.PI * 2.4 + particle.phase) * (1 - damping) * 2.2;
					const p = polar(localR, theta);
					return (
						<circle
							key={particle.key}
							cx={p.x}
							cy={p.y}
							r={0.18 + settle * 0.18}
							fill="rgba(255,255,255,0.95)"
							opacity={0.18 + settle * 0.32}
						/>
					);
				})}
			</svg>
		</div>
	);
}
