/**
 * Definisi bayangan modern menggunakan CSS boxShadow string
 * Dikalibrasi halus untuk mobile iOS & Android (menghindari heavy dark shadowboxing)
 */
export const shadows = {
  none: 'none',
  subtle: '0 1px 2px rgba(15, 23, 42, 0.04)',
  card: '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
  cardElevated: '0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.03)',
  raised: '0 6px 16px rgba(15, 23, 42, 0.06)',
  elevated: '0 8px 24px rgba(15, 23, 42, 0.08)',
  modal: '0 16px 36px rgba(15, 23, 42, 0.12)',
  glow: '0 4px 14px rgba(30, 58, 138, 0.18)',
  glowEmerald: '0 4px 12px rgba(5, 150, 105, 0.16)',
  glowAmber: '0 4px 12px rgba(217, 119, 6, 0.16)',
  floatingBar: '0 -2px 10px rgba(15, 23, 42, 0.03)',

  // Cross-platform style object aliases for spread syntax (...shadows.sm, etc.)
  sm: {
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
  },
  md: {
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
  },
  lg: {
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.03)',
  },
} as const;
