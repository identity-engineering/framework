import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function OrbitalBodies() {
  const groupRef = useRef<THREE.Group>(null);

  const bodies = useMemo(() => {
    const arr: { radius: number; speed: number; size: number; offset: number; tilt: number; color: string }[] = [];
    for (let i = 0; i < 12; i++) {
      arr.push({
        radius: 1.5 + i * 0.4 + Math.random() * 0.3,
        speed: 0.3 / (i + 1) + Math.random() * 0.05,
        size: 0.06 + Math.random() * 0.08,
        offset: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.6,
        color: i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#a78bfa' : '#34d399',
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= bodies.length) return;
      const body = bodies[i];
      const angle = t * body.speed + body.offset;
      child.position.x = Math.cos(angle) * body.radius;
      child.position.y = Math.sin(angle * 0.5) * body.tilt;
      child.position.z = Math.sin(angle) * body.radius;
    });
  });

  return (
    <group ref={groupRef}>
      {bodies.map((body, i) => (
        <mesh key={i}>
          <sphereGeometry args={[body.size, 16, 16]} />
          <meshStandardMaterial
            color={body.color}
            emissive={body.color}
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function AttractionLines() {
  const ref = useRef<THREE.Group>(null);

  const curves = useMemo(() => {
    const result: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < 30; i++) {
      const theta = (i / 30) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j < 20; j++) {
        const t = j / 20;
        const r = 5 * (1 - t * t);
        points.push(new THREE.Vector3(
          Math.cos(theta + t * 1.5) * r,
          (Math.random() - 0.5) * 0.2 * t,
          Math.sin(theta + t * 1.5) * r
        ));
      }
      result.push(new THREE.CatmullRomCurve3(points));
    }
    return result;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015;
  });

  return (
    <group ref={ref}>
      {curves.map((curve, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color="#a78bfa" transparent opacity={0.08} />
          </line>
        );
      })}
    </group>
  );
}

function CentralAttractor() {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) ref.current.rotation.y = t * 0.2;
    if (glowRef.current) {
      const s = 1.5 + Math.sin(t * 0.6) * 0.15;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.35, 2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#a78bfa"
          emissiveIntensity={1.5}
          roughness={0}
          metalness={1}
          wireframe
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

export default function GravitationScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.08} />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#a78bfa" />
        <pointLight position={[4, 2, -3]} intensity={0.6} color="#f472b6" />
        <CentralAttractor />
        <OrbitalBodies />
        <AttractionLines />
        <fog attach="fog" args={['#0a0a0f', 5, 14]} />
      </Canvas>
    </div>
  );
}
