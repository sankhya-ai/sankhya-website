import { MetricsRow, type Metric } from '@/site/components/molecules/MetricsRow';

/**
 * Four numbers, each one a decision rather than a boast.
 *
 * Only the first is a benchmark. The other three are constants in the tutor's
 * own memory: how many kinds of moment it records, how many scores it writes
 * down, and how many states a key point can be in instead of a percentage.
 */
const METRICS: readonly Metric[] = [
  { value: 99.4, decimals: 1, suffix: '%', label: 'Recall@5 on LongMemEval', note: 'Dhee’s retrieval, on the standard long-memory benchmark.' },
  { value: 9, decimals: 0, suffix: '', label: 'Kinds of study moment', note: 'Read, asked, quizzed, taught, watched, noted, highlighted, built, sat.' },
  { value: 0, decimals: 0, suffix: '', label: 'Scores stored', note: 'Where you stand is worked out from the facts each time.' },
  { value: 6, decimals: 0, suffix: '', label: 'States, not a percentage', note: 'Unknown and weak are never drawn the same.' },
];

export function DheeMetrics() {
  return <MetricsRow metrics={METRICS} label="Dhee in numbers" />;
}
