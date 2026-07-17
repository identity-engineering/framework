import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import VortexField from './VortexField';
import OrbitalRings from './OrbitalRings';
import ParticleCloud from './ParticleCloud';
import CoreSphere from './CoreSphere';

export default function GravityScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <pointLight position={[0, 0, 2]} intensity={1.5} color="#a78bfa" />
          <pointLight position={[3, 2, -2]} intensity={0.8} color="#06b6d4" />

          <CoreSphere />
          <VortexField />
          <OrbitalRings />
          <ParticleCloud count={800} />

          <fog attach="fog" args={['#0a0a0f', 6, 18]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
