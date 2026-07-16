import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface MassCurvatureProps {
  initialMass?: number;
}

export default function MassCurvature({ initialMass = 55 }: MassCurvatureProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mass, setMass] = useState(initialMass);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 420;
    const height = 380;
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
      .attr('rx', 16);

    // Subtle glow behind mass
    const defs = svg.append('defs');
    const glow = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glow.append('feGaussianBlur')
      .attr('stdDeviation', '8')
      .attr('result', 'coloredBlur');

    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // === Dense Point Cloud (3D-like curved space) ===
    const pointsGroup = svg.append('g');

    const numPoints = 1450;
    const points: any[] = [];

    // Generate points in a pseudo-3D spherical distribution
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 38 + Math.random() * 125;

      const x3d = r * Math.sin(phi) * Math.cos(theta);
      const y3d = r * Math.sin(phi) * Math.sin(theta);
      const z3d = r * Math.cos(phi);

      points.push({
        x3d,
        y3d,
        z3d,
        baseX: x3d,
        baseY: y3d,
        baseZ: z3d,
      });
    }

    const updateVisualization = (currentMass: number) => {
      pointsGroup.selectAll('*').remove();

      const massFactor = (currentMass - 20) / 95; // 0 to ~1.05
      const curvatureStrength = massFactor * 1.35;

      points.forEach((p) => {
        // Apply curvature (gravitational lensing effect)
        const dist = Math.sqrt(p.baseX * p.baseX + p.baseY * p.baseY);
        const curve = curvatureStrength * (dist / 90) * Math.sin(dist / 45);

        const x = centerX + p.baseX + curve * (p.baseX / (dist || 1));
        const y = centerY + p.baseY + curve * (p.baseY / (dist || 1));

        // Depth-based size and opacity for 3D feel
        const depth = (p.baseZ + 160) / 320;
        const size = 0.9 + depth * 2.1;
        const opacity = 0.35 + depth * 0.55;

        pointsGroup
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', size)
          .attr('fill', '#a5b4fc')
          .attr('opacity', opacity);
      });

      // === Central Mass (beautiful glowing sphere) ===
      const massRadius = 22 + currentMass * 0.38;
      const massColor = d3.interpolateRgb('#3b82f6', '#1e3a8a')(Math.min(massFactor, 1));

      // Outer glow
      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', massRadius + 18)
        .attr('fill', massColor)
        .attr('opacity', 0.12)
        .attr('filter', 'url(#glow)');

      // Main mass sphere
      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', massRadius)
        .attr('fill', massColor)
        .attr('stroke', '#c7d2fe')
        .attr('stroke-width', 1.5);

      // Inner bright core
      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', massRadius * 0.42)
        .attr('fill', '#e0e7ff')
        .attr('opacity', 0.9);
    };

    updateVisualization(mass);

  }, [mass]);

  // Elegant interaction - drag on the visualization to change mass
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0.1, Math.min(1, x / rect.width));
    const newMass = 22 + percentage * 95;
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
        <svg 
          ref={svgRef} 
          className="rounded-3xl shadow-2xl" 
        />
        
        {/* Elegant label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[2px] text-white/40 font-mono pointer-events-none">
          DRAG HORIZONTALLY TO ADJUST MASS
        </div>
      </div>

      <div className="mt-5 text-xs text-white/50 tracking-widest font-mono">
        MASS: <span className="text-white/80 tabular-nums">{mass}</span>
      </div>
    </div>
  );
}