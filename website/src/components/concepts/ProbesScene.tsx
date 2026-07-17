import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ScanBeams() {
  const groupRef = useRef<THREE.Group>(null);

  const beams = useMemo(() => {
    const arr: { angle: number; length: number; speed: number; delay: number }[] = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        angle: (i / 8) * Math.PI * 2,
        length: 3 + Math.random() * 2,
        speed: 0.5 + Math.random() * 0.5,
        delay: i * 0.4,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const beam = beams[i];
      if (!beam) return;
      const progress = ((t * beam.speed + beam.delay) % 3) / 3;
      const opacity = progress < 0.5
        ? progress * 2
        : (1 - progress) * 2;
      (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: opacity * 0.3,
      });
      child.scale.y = 0.5 + progress * 1.5;
    });
  });

  return (
    <group ref={groupRef}>
      {beams.map((beam, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(beam.angle) * beam.length * 0.5,
            0,
            Math.sin(beam.angle) * beam.length * 0.5,
          ]}
          rotation={[0, 0, -beam.angle + Math.PI / 2]}
        >
          <boxGeometry args={[0.015, beam.length, 0.015]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function DataNodes() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const arr: { pos: [number, number, number]; size: number; pulseSpeed: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 1 + Math.random() * 3;
      arr.push({
        pos: [Math.cos(theta) * r, (Math.random() - 0.5) * 2, Math.sin(theta) * r],
        size: 0.04 + Math.random() * 0.06,
        pulseSpeed: 1 + Math.random() * 2,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i];
      if (!node) return;
      const scale = 1 + Math.sin(t * node.pulseSpeed) * 0.3;
      child.scale.set(scale, scale, scale);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.pos}>
          <octahedronGeometry args={[node.size]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function ConnectionWeb() {
  const ref = useRef<THREE.Group>(null);

  const connections = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 15; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 1 + Math.random() * 3;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, (Math.random() - 0.5) * 2, Math.sin(theta) * r));
    }

    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 2.5) {
          lines.push([pts[i], pts[j]]);
        }
      }
    }
    return lines;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <group ref={ref}>
      {connections.map(([a, b], i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color="#22d3ee" transparent opacity={0.15} />
          </line>
        );
      })}
    </group>
  );
}

function CenterProbe() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.3;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#22d3ee"
          emissiveIntensity={2}
          roughness={0}
          metalness={1}
          wireframe
        />
      </mesh>
      {[0, Math.PI / 2, Math.PI].map((rot, i) => (
        <mesh key={i} rotation={[rot, rot * 0.5, 0]}>
          <torusGeometry args={[0.5, 0.008, 8, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function ProbesScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-3, 2, 2]} intensity={0.5} color="#a78bfa" />
        <CenterProbe />
        <ScanBeams />
        <DataNodes />
        <ConnectionWeb />
        <fog attach="fog" args={['#0a0a0f', 5, 14]} />
      </Canvas>
    </div>
  );
}
