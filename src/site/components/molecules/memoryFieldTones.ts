/** The colours the Insights legend uses, shared by the field and its legend. */
export const FIELD_TONES = {
  untouched: 'rgba(40, 50, 64, .5)',
  read: '#8d99ab',
  solid: '#6f9e32',
  shaky: '#c2593f',
  fading: '#c1893f',
} as const;

export type FieldTone = keyof typeof FIELD_TONES;
