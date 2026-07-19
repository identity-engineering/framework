import { useEffect, useMemo, useRef, useState } from 'react';

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function polar(radius: number, angle: number) {
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

function buildShellPath(radius: number, depth: number, progress: number, phase: number) {
  const pts: string[] = [];
  const distortion = 0.42 + progress * 2.5 * depth;
  const wobble = progress * Math.PI * (2.2 + depth * 0.9) + phase;
  const ripple = progress * Math.PI * (4.1 + depth * 0.6) - phase * 0.55;

  for (let deg = 0; deg <= 360; deg += 8) {
    const t = (deg * Math.PI) / 180;
    const localR =
      radius +
      Math.sin(t * (3.0 + depth) + wobble) * distortion +
      Math.sin(t * (5.2 + depth * 0.6) - ripple) * distortion * 0.45;
    const p = polar(localR, t);
    pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }

  return `M ${pts.join(' L ')} Z`;
}

function buildFilamentPoints(angle: number, length: number, progress: number, phase: number) {
  const pts: string[] = [];
  const bendScale = 0.18 + progress * 0.42;
  const lock = 0.14 + progress * 0.72;

  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const radius = length * t;
    const bend = Math.sin(t * Math.PI * (1.6 + lock) + progress * Math.PI * 2.4 + phase) * bendScale * t;
    const off = Math.cos(t * Math.PI * (2.1 + lock * 0.5) - phase) * bendScale * 0.45;
    const p = polar(radius, angle);
    const x = p.x + Math.cos(angle + Math.PI / 2) * bend + Math.cos(angle) * off;
    const y = p.y + Math.sin(angle + Math.PI / 2) * bend + Math.sin(angle) * off;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return pts.join(' ');
}

export default function FrequencyScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.92;
      const end = -rect.height * 0.35;
      const raw = (start - rect.top) / (start - end);
      setProgress(clamp01(raw));
    };

    const onScrollOrResize = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  const shells = useMemo(
    () => [
      { key: 's1', radius: 10.5, depth: 0.35, phase: 0.2, opacity: 0.18 },
      { key: 's2', radius: 15.6, depth: 0.52, phase: 0.9, opacity: 0.22 },
      { key: 's3', radius: 21.4, depth: 0.72, phase: 1.4, opacity: 0.28 },
      { key: 's4', radius: 28.2, depth: 0.92, phase: 2.1, opacity: 0.3 },
      { key: 's5', radius: 36.5, depth: 1.1, phase: 2.8, opacity: 0.24 },
    ],
    []
  );

  const filaments = useMemo(
    () => [
      { key: 'f1', angle: 0.1, length: 39, phase: 0.1 },
      { key: 'f2', angle: 0.46, length: 37, phase: 0.8 },
      { key: 'f3', angle: 0.89, length: 41, phase: 1.4 },
      { key: 'f4', angle: 1.38, length: 38, phase: 2.1 },
      { key: 'f5', angle: 1.95, length: 40, phase: 2.7 },
      { key: 'f6', angle: 2.42, length: 36, phase: 3.2 },
      { key: 'f7', angle: 2.84, length: 39, phase: 3.7 },
      { key: 'f8', angle: 3.32, length: 37, phase: 4.2 },
      { key: 'f9', angle: 3.82, length: 41, phase: 4.8 },
      { key: 'f10', angle: 4.26, length: 38, phase: 5.3 },
      { key: 'f11', angle: 4.76, length: 40, phase: 5.8 },
      { key: 'f12', angle: 5.31, length: 36, phase: 6.2 },
    ],
    []
  );

  const particles = useMemo(
    () => [
      { key: 'p1', a: 0.18, r: 22 },
      { key: 'p2', a: 0.78, r: 26 },
      { key: 'p3', a: 1.32, r: 19 },
      { key: 'p4', a: 1.88, r: 30 },
      { key: 'p5', a: 2.42, r: 23 },
      { key: 'p6', a: 3.06, r: 28 },
      { key: 'p7', a: 3.62, r: 25 },
      { key: 'p8', a: 4.18, r: 31 },
      { key: 'p9', a: 4.76, r: 20 },
      { key: 'p10', a: 5.34, r: 27 },
      { key: 'p11', a: 5.94, r: 24 },
    ],
    []
  );

  const lock = smoothstep(0.18, 0.84, progress);
  const coreScale = 0.95 + lock * 0.14;
  const coreSpin = progress * 10;
  const coreRise = Math.sin(progress * Math.PI * 3.2) * 0.35 * lock;

  return (
    <div ref={rootRef} className="frequency-scene" data-progress={progress.toFixed(3)}>
      <style>{`
        .frequency-scene {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 50%, rgba(245,245,245,0.08), rgba(10,10,15,0.96) 64%),
            linear-gradient(180deg, rgba(161,161,170,0.06), rgba(10,10,15,0.9));
        }
        .frequency-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .frequency-label {
          position: absolute;
          right: 10px;
          bottom: 8px;
          color: rgba(212, 212, 216, 0.5);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
      `}</style>

      <svg className="frequency-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="freq-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,245,245,0.82)" />
            <stop offset="35%" stopColor="rgba(212,212,216,0.3)" />
            <stop offset="100%" stopColor="rgba(10,10,15,0)" />
          </radialGradient>
          <linearGradient id="freq-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(161,161,170,0.06)" />
            <stop offset="50%" stopColor="rgba(245,245,245,0.5)" />
            <stop offset="100%" stopColor="rgba(161,161,170,0.06)" />
          </linearGradient>
        </defs>

        <g transform={`translate(50 ${50 + coreRise}) rotate(${coreSpin} 50 50) scale(${coreScale})`}>
          <ellipse cx="50" cy="50" rx="3.8" ry="3.2" fill="url(#freq-core-glow)" opacity={0.95} />
          <path
            d="M 50 46.6 L 53.8 50 L 50 53.4 L 46.2 50 Z"
            fill="rgba(245,245,245,0.9)"
            opacity={0.82 + lock * 0.16}
          />
          <circle cx="50" cy="50" r={1.05 + lock * 0.22} fill="rgba(245,245,245,0.98)" opacity={0.88} />
          <path
            d={`M 50 43.6 L 53.6 50 L 50 56.4 L 46.4 50 Z`}
            fill="none"
            stroke="rgba(245,245,245,0.8)"
            strokeWidth="0.32"
            opacity={0.34 + lock * 0.28}
          />
        </g>

        {shells.map((shell) => (
          <path
            key={shell.key}
            d={buildShellPath(shell.radius, shell.depth, progress, shell.phase)}
            fill="none"
            stroke="url(#freq-stroke)"
            strokeWidth={0.26 + shell.depth * 0.1}
            strokeOpacity={shell.opacity + lock * 0.08}
          />
        ))}

        {filaments.map((filament, index) => {
          const waviness = 0.16 + lock * 0.42;
          const bend = Math.sin(progress * Math.PI * (2.1 + index * 0.04) + filament.phase) * waviness;
          return (
            <polyline
              key={filament.key}
              points={buildFilamentPoints(filament.angle + bend * 0.08, filament.length, progress, filament.phase)}
              fill="none"
              stroke="rgba(212,212,216,0.36)"
              strokeWidth={0.16 + lock * 0.08}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.14 + lock * 0.16}
            />
          );
        })}

        {particles.map((particle, i) => {
          const theta = particle.a + progress * (0.8 + i * 0.03);
          const drift = particle.r + Math.sin(progress * Math.PI * (2.2 + i * 0.11)) * (0.7 + lock * 1.3);
          const p = polar(drift, theta);
          return (
            <circle
              key={particle.key}
              cx={p.x}
              cy={p.y}
              r={0.22 + lock * 0.18 + (i % 3) * 0.03}
              fill="rgba(245,245,245,0.84)"
              opacity={0.24 + lock * 0.42}
            />
          );
        })}
      </svg>

      <div className="frequency-label">inner tension continuum</div>
    </div>
  );
}