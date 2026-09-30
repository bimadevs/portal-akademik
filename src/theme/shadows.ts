/**
 * Definisi bayangan modern menggunakan CSS boxShadow string
 * Sesuai panduan expo-native-ui (menghindari deprecated elevation/shadowOffset)
 */
export const shadows = {
  none: 'none',
  subtle: '0 1px 3px rgba(15, 23, 42, 0.05)',
  card: '0 2px 10px rgba(15, 23, 42, 0.06)',
  cardElevated: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
  raised: '0 4px 16px rgba(15, 23, 42, 0.08)',
  elevated: '0 12px 30px rgba(15, 23, 42, 0.12)',
  glow: '0 8px 20px rgba(37, 99, 235, 0.35)',
  glowEmerald: '0 6px 16px rgba(16, 185, 129, 0.3)',
  glowAmber: '0 6px 16px rgba(245, 158, 11, 0.3)',
  floatingBar: '0 -4px 20px rgba(15, 23, 42, 0.06)',
} as const;
