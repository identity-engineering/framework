import { useEffect, type MutableRefObject } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Binds window scroll → progress ref (0–1) for the enclosing [data-concept-section].
 * Uses frameloop="demand": invalidates the canvas only while scrolling.
 * Hero stays on continuous frameloop; concept scenes only redraw on scroll.
 */
export default function ScrollProgressController({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const track =
      (gl.domElement.closest('[data-concept-section]') as HTMLElement | null) ??
      (gl.domElement.closest('[data-concept-mount]') as HTMLElement | null) ??
      document.documentElement;

    const update = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0: section top at bottom of viewport
      // 1: section bottom at top of viewport
      const p = (vh - rect.top) / (vh + Math.max(rect.height, 1));
      progress.current = Math.min(1, Math.max(0, p));
      invalidate();
    };

    update();
    // Extra kick after layout settles (card size / fonts)
    const t1 = window.setTimeout(update, 32);
    const t2 = window.setTimeout(update, 200);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [gl, invalidate, progress]);

  return null;
}
