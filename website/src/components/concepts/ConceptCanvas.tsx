/* @jsxRuntime classic */
import { installTimerClock } from '../../lib/installTimerClock';
// Must run before R3F constructs THREE.Clock in its store
installTimerClock();

import React, { useEffect, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { mono } from './mono';

interface Props {
  children: ReactNode;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
  fogFar?: number;
}

/** Kick at least one frame so demand-mode scenes aren't blank before first scroll. */
function InitialPaint() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    const t = window.setTimeout(() => invalidate(), 50);
    return () => window.clearTimeout(t);
  }, [invalidate]);
  return null;
}

/**
 * Shared R3F shell for concept scenes.
 * frameloop="demand" — paints on mount + when ScrollProgressController invalidates.
 */
export default function ConceptCanvas({
  children,
  camera = { position: [0, 1.2, 5], fov: 50 },
  fogFar = 14,
}: Props) {
  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: 240 }}>
      <Canvas
        camera={camera}
        dpr={[1, 1.5]}
        frameloop="demand"
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, powerPreference: 'high-performance', antialias: true }}
      >
        <color attach="background" args={[mono.bg]} />
        <ambientLight intensity={0.12} />
        <pointLight position={[2.5, 2.5, 3]} intensity={0.95} color="#ffffff" />
        <pointLight position={[-2, -1, 2]} intensity={0.4} color="#a1a1aa" />
        <InitialPaint />
        {children}
        <fog attach="fog" args={[mono.bg, 5, fogFar]} />
      </Canvas>
    </div>
  );
}
