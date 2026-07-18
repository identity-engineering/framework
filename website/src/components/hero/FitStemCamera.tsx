import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STEM_CAMERA_FOV, STEM_FIT_MARGIN, STEM_WORLD_HEIGHT } from './stemLayout';

/**
 * Frames the stem so its full vertical extent always fits the current canvas.
 * Re-runs on resize — stage size changes (title taller/shorter) auto-adjust distance.
 */
export default function FitStemCamera() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = STEM_CAMERA_FOV;

    // Vertical half-extent of the stem in world units (with margin)
    const halfExtent = (STEM_WORLD_HEIGHT / 2) * STEM_FIT_MARGIN;

    // Distance so that halfExtent fills half the vertical FOV
    const dist = halfExtent / Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5));

    cam.position.set(0, 0, dist);
    cam.near = 0.1;
    cam.far = Math.max(40, dist * 4);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}
