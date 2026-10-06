/**
 * Definisi bayangan bernuansa hangat (warm stone & crimson)
 * Dikalibrasi halus untuk mobile iOS & Android (menghindari heavy dark shadowboxing)
 */
export const shadows = {
  none: 'none',
  subtle: '0 1px 2px rgba(28, 25, 23, 0.04)',
  card: '0 2px 8px rgba(28, 25, 23, 0.04), 0 1px 2px rgba(28, 25, 23, 0.02)',
  cardElevated: '0 4px 14px rgba(28, 25, 23, 0.06), 0 1px 3px rgba(28, 25, 23, 0.03)',
  raised: '0 6px 16px rgba(28, 25, 23, 0.06)',
  elevated: '0 8px 24px rgba(28, 25, 23, 0.08)',
  modal: '0 16px 36px rgba(28, 25, 23, 0.12)',

  // Brand-tinted glows
  glow: '0 4px 14px rgba(179, 32, 42, 0.18)', // UBD Crimson glow
  glowCrimson: '0 4px 14px rgba(179, 32, 42, 0.18)',
  glowBlue: '0 4px 14px rgba(37, 86, 168, 0.16)',
  glowEmerald: '0 4px 12px rgba(31, 138, 91, 0.16)',
  glowAmber: '0 4px 12px rgba(207, 111, 23, 0.16)',
  glowSaffron: '0 4px 12px rgba(207, 111, 23, 0.16)',
  floatingBar: '0 -2px 10px rgba(28, 25, 23, 0.04)',

  // Cross-platform style object aliases for spread syntax
  sm: {
    boxShadow: '0 1px 2px rgba(28, 25, 23, 0.04)',
  },
  md: {
    boxShadow: '0 2px 8px rgba(28, 25, 23, 0.04), 0 1px 2px rgba(28, 25, 23, 0.02)',
  },
  lg: {
    boxShadow: '0 4px 14px rgba(28, 25, 23, 0.06), 0 1px 3px rgba(28, 25, 23, 0.03)',
  },
} as const;

export type ShadowKey = keyof typeof shadows;
