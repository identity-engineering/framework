import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface MassCurvatureProps {
  initialMass?: number;
}

export default function MassCurvature({ initialMass = 55 }: MassCurvatureProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mass, setMass] = useState(initialMass);
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 520;
    const height = 460;
    const centerX = width / 2;
    const centerY = height / 2;

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0a0a0a')
      .attr('rx', 20);

    // Glow filter
    const defs = svg.append('defs');
    const glow = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glow.append('feGaussianBlur')
      .attr('stdDeviation', '9')
      .attr('result', 'coloredBlur');

    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const pointsGroup = svg.append('g');

    const numPoints = 1650;
    const points: any[] = [];

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 42 + Math.random() * 138;

      const x3d = r * Math.sin(phi) * Math.cos(theta);
      const y3d = r * Math.sin(phi) * Math.sin(theta);
      const z3d = r * Math.cos(phi);

      points.push({ x3d, y3d, z3d, baseX: x3d, baseY: y3d, baseZ: z3d });
    }

    const updateVisualization = (currentMass: number, time: number = 0) => {
      pointsGroup.selectAll('*').remove();

      const massFactor = (currentMass - 20) / 95;
      const curvatureStrength = massFactor * 1.4;

      const rotation = time * 0.0008; // very slow idle rotation

      points.forEach((p) => {
        // Apply gentle rotation for life
        const rotX = p.baseX * Math.cos(rotation) - p.baseZ * Math.sin(rotation) * 0.6;
        const rotZ = p.baseX * Math.sin(rotation) * 0.6 + p.baseZ * Math.cos(rotation);

        const dist = Math.sqrt(rotX * rotX + p.baseY * p.baseY);
        const curve = curvatureStrength * (dist / 95) * Math.sin(dist / 48);

        const x = centerX + rotX + curve * (rotX / (dist || 1));
        const y = centerY + p.baseY + curve * (p.baseY / (dist || 1));

        const depth = (rotZ + 170) / 340;
        const size = 0.85 + depth * 2.15;
        const opacity = 0.32 + depth * 0.58;

        pointsGroup
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', size)
          .attr('fill', '#a5b4fc')
          .attr('opacity', opacity);
      });

      // Central glowing mass
      const massRadius = 24 + currentMass * 0.37;
      const massColor = d3.interpolateRgb('#3b82f6', '#1e3a8a')(Math.min(massFactor, 1));

      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', massRadius + 22)
        .attr('fill', massColor)
        .attr('opacity', 0.11)
        .attr('filter', 'url(#glow)');

      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', massRadius)
        .attr('fill', massColor)
        .attr('stroke', '#c7d2fe')
        .attr('stroke-width', 1.8);

      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', massRadius * 0.4)
        .attr('fill', '#e0e7ff')
        .attr('opacity', 0.85);
    };

    // Animation loop for subtle movement
    const animate = () => {
      timeRef.current += 16;
      updateVisualization(mass, timeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    updateVisualization(mass, 0);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mass]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0.08, Math.min(1, x / rect.width));
    const newMass = 22 + percentage * 98;
    setMass(Math.round(newMass));
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div 
        className="relative cursor-col-resize"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
      >
        <svg ref={svgRef} className="rounded-3xl shadow-2xl" />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] tracking-[2.5px] text-white/35 font-mono pointer-events-none">
          DRAG TO ADJUST MASS
        </div>
      </div>

      <div className="mt-4 text-[10px] text-white/50 tracking-[3px] font-mono">
        MASS <span className="text-white/75 tabular-nums">{mass}</span>
      </div>
    </div>
  );
}