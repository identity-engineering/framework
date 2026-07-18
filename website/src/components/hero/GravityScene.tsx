import { installTimerClock } from '../../lib/installTimerClock';
// Must run before R3F constructs THREE.Clock in its store
installTimerClock();

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import IdentityStem from './IdentityStem';
import StemParticles from './StemParticles';
import FitStemCamera from './FitStemCamera';
import { useIsMobile } from './useIsMobile';
import { STEM_CAMERA_FOV } from './stemLayout';

interface Props {
  /** Smaller particle budget for embedded / framework cards */
  compact?: boolean;
}

/**
 * Identity Stem stage — fills its parent container only.
 * Camera auto-fits the stem to whatever size the stage is given by CSS.
 */
export default function GravityScene({ compact = false }: Props) {
  const isMobile = useIsMobile();
  const particleCount = isMobile ? 140 : compact ? 200 : 520;

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: STEM_CAMERA_FOV }}
        dpr={isMobile || compact ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: !(isMobile || compact), alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 2]} intensity={1.1} color="#ffffff" />
          <pointLight position={[0, 2.5, 1]} intensity={0.55} color="#d4d4d8" />
          <pointLight position={[2, -2, 3]} intensity={0.35} color="#a1a1aa" />

          <FitStemCamera />

          {/* Stem centered at origin — framing is handled by FitStemCamera */}
          <group>
            <IdentityStem />
            <StemParticles count={particleCount} />
          </group>

          <fog attach="fog" args={['#0a0a0f', 6, 20]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
