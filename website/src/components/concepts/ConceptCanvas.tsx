import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { mono } from './mono';

interface Props {
  children: ReactNode;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
  fogFar?: number;
}

/**
 * Shared R3F shell for concept scenes.
 * frameloop="demand" — only paints when ScrollProgressController invalidates (on scroll).
 */
export default function ConceptCanvas({
  children,
  camera = { position: [0, 1.2, 5], fov: 50 },
  fogFar = 14,
}: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={camera}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, powerPreference: 'high-performance', antialias: true }}
      >
        <color attach="background" args={[mono.bg]} />
        <ambientLight intensity={0.12} />
        <pointLight position={[2.5, 2.5, 3]} intensity={0.95} color="#ffffff" />
        <pointLight position={[-2, -1, 2]} intensity={0.4} color="#a1a1aa" />
        {children}
        <fog attach="fog" args={[mono.bg, 5, fogFar]} />
      </Canvas>
    </div>
  );
}
