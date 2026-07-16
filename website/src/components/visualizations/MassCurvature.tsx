import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface MassCurvatureProps {
  initialMass?: number;
}

export default function MassCurvature({ initialMass = 50 }: MassCurvatureProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mass, setMass] = useState(initialMass);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 320;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.attr('width', width).attr('height', height);

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#111');

    // Grid lines (curved space visualization)
    const gridGroup = svg.append('g');

    const drawCurvedGrid = (currentMass: number) => {
      gridGroup.selectAll('*').remove();

      const strength = (currentMass - 20) / 80; // 0 to ~1

      // Horizontal lines
      for (let i = -4; i <= 4; i++) {
        const y = centerY + i * 28;
        const path = d3.line()
          .x(d => d[0])
          .y(d => {
            const distFromCenter = Math.abs(d[0] - centerX);
            const curve = strength * 18 * Math.sin((d[0] - centerX) / 80);
            return y + curve * (distFromCenter / 180);
          });

        gridGroup.append('path')
          .datum(d3.range(20, width - 20, 8))
          .attr('d', path)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('fill', 'none');
      }

      // Vertical lines
      for (let i = -5; i <= 5; i++) {
        const x = centerX + i * 32;
        const path = d3.line()
          .x(d => {
            const distFromCenter = Math.abs(d[1] - centerY);
            const curve = strength * 18 * Math.sin((d[1] - centerY) / 80);
            return x + curve * (distFromCenter / 160);
          })
          .y(d => d[1]);

        gridGroup.append('path')
          .datum(d3.range(20, height - 20, 8))
          .attr('d', path)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('fill', 'none');
      }
    };

    drawCurvedGrid(mass);

    // Central Mass circle
    const massGroup = svg.append('g');

    const updateMass = (currentMass: number) => {
      massGroup.selectAll('*').remove();

      const radius = 18 + (currentMass / 100) * 42;
      const color = d3.interpolateRgb('#3b82f6', '#1e40af')(currentMass / 100);

      massGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Inner core
      massGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius * 0.55)
        .attr('fill', d3.color(color)?.brighter(1.2) as any || '#fff');
    };

    updateMass(mass);

    // Update when mass changes
    return () => {
      // cleanup if needed
    };
  }, [mass]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} className="rounded-2xl" />
      
      <div className="mt-6 w-full max-w-[380px]">
        <div className="flex justify-between text-sm mb-2 text-white/60">
          <div>Low Stake</div>
          <div>High Stake (Mass)</div>
        </div>
        <input
          type="range"
          min="20"
          max="120"
          step="1"
          value={mass}
          onChange={(e) => setMass(parseInt(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="text-center mt-1 text-sm font-mono text-white/70">
          Mass: {mass}
        </div>
      </div>
    </div>
  );
}