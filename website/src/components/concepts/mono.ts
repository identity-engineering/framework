/** Shared monochrome palette for concept scenes (matches hero). */
export const mono = {
  white: '#f5f5f5',
  high: '#d4d4d8',
  mid: '#a1a1aa',
  low: '#71717a',
  dim: '#52525b',
  core: '#0a0a0a',
  bg: '#0a0a0f',
} as const;

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
