import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface MassCurvatureProps {
  initialMass?: number;
}

export default function MassCurvature({ initialMass = 55 }: MassCurvatureProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mass, setMass] = useState(initialMass);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Scroll-driven rotation (only when scrolling the page)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0a0a0a')
      .attr('rx', 20);

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

    const pointsGroup = svg.append('g');

    const numPoints = 1720;
    const points: any[] = [];

    // Create points with emphasis on a central vertical identity stem
    for (let i = 0; i < numPoints; i++) {
      const isCoreStrand = Math.random() < 0.18; // ~18% are central identity strands

      let x3d, y3d, z3d;

      if (isCoreStrand) {
        // Central identity stem (vertical bundle)
        x3d = (Math.random() - 0.5) * 22;
        y3d = (Math.random() - 0.5) * 195;
        z3d = (Math.random() - 0.5) * 18;
      } else {
        // Surrounding field
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 55 + Math.random() * 135;
        x3d = r * Math.sin(phi) * Math.cos(theta);
        y3d = r * Math.sin(phi) * Math.sin(theta) * 0.65;
        z3d = r * Math.cos(phi);
      }

      points.push({ x3d, y3d, z3d, baseX: x3d, baseY: y3d, baseZ: z3d, isCoreStrand });
    }

    const updateVisualization = (currentMass: number, scroll: number) => {
      pointsGroup.selectAll('*').remove();

      const massFactor = (currentMass - 20) / 95;
      const curvatureStrength = massFactor * 1.45;

      // Scroll-driven gentle rotation (only when user scrolls)
      const rotation = scroll * 1.8;

      points.forEach((p) => {
        let rotX = p.baseX;
        let rotZ = p.baseZ;

        if (!p.isCoreStrand) {
          rotX = p.baseX * Math.cos(rotation) - p.baseZ * Math.sin(rotation) * 0.55;
          rotZ = p.baseX * Math.sin(rotation) * 0.55 + p.baseZ * Math.cos(rotation);
        }

        const dist = Math.sqrt(rotX * rotX + p.baseY * p.baseY);
        const curve = curvatureStrength * (dist / 95) * Math.sin(dist / 48);

        const x = centerX + rotX + curve * (rotX / (dist || 1));
        const y = centerY + p.baseY + curve * (p.baseY / (dist || 1));

        const depth = (rotZ + 170) / 340;
        const size = p.isCoreStrand ? 1.6 : 0.8 + depth * 2.0;
        const opacity = p.isCoreStrand ? 0.85 : 0.28 + depth * 0.6;
        const color = p.isCoreStrand ? '#c4b5fd' : '#a5b4fc';

        pointsGroup
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', size)
          .attr('fill', color)
          .attr('opacity', opacity);
      });

      // Smaller central core (identity stem top)
      const coreRadius = 11 + currentMass * 0.18;
      const coreColor = d3.interpolateRgb('#6366f1', '#312e81')(Math.min(massFactor, 1));

      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY - 8)
        .attr('r', coreRadius + 14)
        .attr('fill', coreColor)
        .attr('opacity', 0.09)
        .attr('filter', 'url(#glow)');

      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY - 8)
        .attr('r', coreRadius)
        .attr('fill', coreColor)
        .attr('stroke', '#a5b4fc')
        .attr('stroke-width', 1.5);

      pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY - 8)
        .attr('r', coreRadius * 0.45)
        .attr('fill', '#e0e7ff')
        .attr('opacity', 0.75);
    };

    updateVisualization(mass, scrollProgress);

  }, [mass, scrollProgress]);

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