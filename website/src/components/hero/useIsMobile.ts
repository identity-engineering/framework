import { useEffect, useState } from 'react';

/** True when viewport is phone-sized or user prefers reduced motion. */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsMobile(mq.matches || reduced.matches);
    update();
    mq.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, [breakpoint]);

  return isMobile;
}
