/**
 * Shared layout constants for the Identity Stem hero.
 * Camera fit and section layout derive from these — avoid magic offsets elsewhere.
 */

/** Approximate world-space height of the stem (past pole → future pole). */
export const STEM_WORLD_HEIGHT = 5.2;

/** Extra padding when framing the stem in the camera (1 = tight, 1.2 = air). */
export const STEM_FIT_MARGIN = 1.02;

/** Perspective FOV (vertical degrees). */
export const STEM_CAMERA_FOV = 42;
