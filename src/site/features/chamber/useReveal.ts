import { useEffect, useRef, useState } from 'react';

/**
 * Show a mock's lines one at a time once it scrolls into view.
 *
 * 'static' is the prerendered state, everything shown, for crawlers and for
 * anyone without JavaScript or with reduced motion. In a browser the lines are
 * hidden ('waiting') until the element is seen, then let in on their own delays
 * ('playing'); the CSS reads the phase from the `is-<phase>` class.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<'static' | 'waiting' | 'playing'>('static');
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPhase('waiting');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setPhase('playing');
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, phase };
}
