import { FIELD_TONES } from '@/site/components/molecules/memoryFieldTones';

const ITEMS = [
  ['untouched', 'not asked yet'],
  ['solid', 'holding'],
  ['shaky', 'needs another look'],
  ['fading', 'fading'],
] as const;

/** The legend the Insights screen prints, in the same four words. */
export function FieldLegend({ className }: { className?: string }) {
  return (
    <ul className={['field-legend', className].filter(Boolean).join(' ')}>
      {ITEMS.map(([tone, label]) => (
        <li key={tone}>
          <i className={tone === 'untouched' ? 'is-hollow' : undefined} style={{ '--dot': FIELD_TONES[tone] } as React.CSSProperties} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
