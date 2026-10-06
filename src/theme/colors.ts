/**
 * Palet warna resmi Universitas Buddhi Dharma (UBD) & Antarmuka Modern
 * Mengacu pada docs/CONTEXT.md & tema mobile kontemporer anti-slop.
 */

export const colors = {
  // Warna Utama UBD (Academic Sapphire)
  primary: '#1E3A8A', // Deep Academic Sapphire (Tombol, Header, Aksen Utama)
  primaryDark: '#0F1E47', // Midnight Navy
  primaryLight: '#EFF6FF', // Soft Blue Background Tint
  primaryHover: '#172554',
  primaryAccent: '#2563EB', // Interaktif & Fokus
  accent: '#2563EB', // Cerulean Blue Accent
  accentLight: '#DBEAFE',
  accentDark: '#1D4ED8',

  // Latar Belakang & Permukaan
  background: '#F8FAFC', // Slate 50 clean mobile canvas
  surface: '#FFFFFF', // Pure White untuk card dan list container
  surfaceSubtle: '#F1F5F9', // Subtle card container background
  surfaceElevated: '#FFFFFF',

  // Teks & Kontras
  textPrimary: '#0F172A', // Slate 900 (High contrast readability)
  textSecondary: '#475569', // Slate 600 (Subheads, metadata)
  textTertiary: '#94A3B8', // Slate 400 (Dividers, hints, placeholders)
  textMuted: '#94A3B8', // Slate 400 (Dividers, hints, placeholders)
  textOnPrimary: '#FFFFFF', // Putih di atas tombol primer

  // Garis Pemisah & Bingkai
  border: '#E2E8F0', // Slate 200 (Clean hairline dividers)
  borderDefault: '#E2E8F0',
  borderSubtle: '#F1F5F9', // Slate 100
  borderFocus: '#1E3A8A', // Focused input border
  borderMuted: '#F1F5F9',

  // Status & Indikator
  danger: '#DC2626', // Merah peringatan / tombol Hapus
  dangerLight: '#FEF2F2',
  dangerDark: '#991B1B',
  success: '#059669', // Hijau indikator sukses
  successLight: '#ECFDF5',
  successDark: '#065F46',
  warning: '#D97706', // Amber status
  warningLight: '#FFFBEB',
  warningDark: '#92400E',
  info: '#0284C7', // Sky Blue informasi
  infoLight: '#E0F2FE',

  // Elemen Khusus
  radioActive: '#1E3A8A', // UBD Navy active
  radioInactive: '#CBD5E1',

  // Identitas Warna Fakultas UBD (Terstandar & Berkelas)
  faculty: {
    saintek: '#0284C7', // Sky Tech
    saintekLight: '#E0F2FE',
    bisnis: '#0D9488', // Teal Finance
    bisnisLight: '#CCFBF1',
    komunikasi: '#7C3AED', // Violet Creative
    komunikasiLight: '#EDE9FE',
    soshum: '#C2410C', // Rust/Warm Amber Humaniora
    soshumLight: '#FFEDD5',
  },

  // Gradient Presets (Disiplin, Halus, Tidak Slop)
  gradients: {
    primary: ['#0F1E47', '#1E3A8A'] as const,
    primarySubtle: ['#EFF6FF', '#DBEAFE'] as const,
    heroLogin: ['#070F26', '#1E3A8A'] as const,
    cardSaintek: ['#0284C7', '#0369A1'] as const,
    cardBisnis: ['#0D9488', '#0F766E'] as const,
    cardKomunikasi: ['#7C3AED', '#6D28D9'] as const,
    cardSoshum: ['#C2410C', '#9A3412'] as const,
    badgeSoft: ['#F1F5F9', '#E2E8F0'] as const,
    tabIndicator: ['#1E3A8A', '#2563EB'] as const,
  },
} as const;

export type ColorKey = keyof typeof colors;
