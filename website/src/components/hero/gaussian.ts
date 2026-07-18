/** Radial envelope of mass around the stem: max at present (y=0), tapering toward both poles. */
export function gaussianEnvelope(y: number, sigma = 1.05, floor = 0.08): number {
  return floor + (1 - floor) * Math.exp(-(y * y) / (2 * sigma * sigma));
}
