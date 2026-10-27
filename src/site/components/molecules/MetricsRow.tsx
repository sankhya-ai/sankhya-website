import { useEffect, useRef, useState } from 'react';

/**
 * A row of four numbers that count up once they scroll into view, after
 * sarvam.ai's stat grid. Shared by the Dhee and Chamber pages; each page brings
 * its own numbers, and each number should be a decision rather than a boast.
 */
export type Metric = { value: number; decimals: number; prefix?: string; suffix: string; label: string; note: string };

function useCountUp(target: number, decimals: number, active: boolean) {
  // Starts at the real number, not zero: the page is prerendered, and a crawler
  // reading "0.0% Recall@5" would be reading a lie. The count runs from zero only
  // once the numbers scroll into view, by which point they are off-screen no more.
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (!active || target === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Number((target * eased).toFixed(decimals)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, decimals, target]);
  return value;
}

function Item({ metric, active }: { metric: Metric; active: boolean }) {
  const value = useCountUp(metric.value, metric.decimals, active);
  const prefix = metric.prefix ?? '';
  return (
    <div className="metrics-row__item">
      <dt>{metric.label}</dt>
      <dd>
        <strong aria-label={`${prefix}${metric.value}${metric.suffix}`}>{prefix}{value.toFixed(metric.decimals)}{metric.suffix}</strong>
        <span>{metric.note}</span>
      </dd>
    </div>
  );
}

export function MetricsRow({ metrics, label }: { metrics: readonly Metric[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setActive(true);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="metrics-row" aria-label={label}>
      <dl>
        {metrics.map((metric) => <Item key={metric.label} metric={metric} active={active} />)}
      </dl>
    </section>
  );
}
