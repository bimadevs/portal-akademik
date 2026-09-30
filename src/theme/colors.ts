/**
 * Palet warna resmi Universitas Buddhi Dharma (UBD) & Antarmuka Modern
 * Mengacu pada docs/CONTEXT.md & tema mobile kontemporer.
 */

export const colors = {
  // Warna Utama UBD
  primary: '#2B52BA', // UBD Royal Sapphire Blue (Tombol LOGIN, SAVE, Tab Aktif)
  primaryDark: '#1E3A8A', // Deep Academic Navy
  primaryLight: '#EFF6FF', // Soft Blue Background Tint
  primaryHover: '#23449E',
  accent: '#3B62C6', // Cerulean Accent

  // Latar Belakang & Permukaan
  background: '#F8FAFC', // Slate soft clean background
  surface: '#FFFFFF', // Pure White untuk card dan list container
  surfaceSubtle: '#F1F5F9', // Subtle card container background

  // Teks & Kontras
  textPrimary: '#0F172A', // Slate 900 (High contrast readability)
  textSecondary: '#64748B', // Slate 500 (Subheads, placeholders, metadata)
  textMuted: '#94A3B8', // Slate 400 (Dividers, hints)
  textOnPrimary: '#FFFFFF', // Putih di atas tombol primer

  // Garis Pemisah & Bingkai
  border: '#E2E8F0', // Slate 200 (Clean hairline dividers)
  borderFocus: '#2B52BA', // Focused input border
  borderMuted: '#F1F5F9',

  // Status & Indikator
  danger: '#EF4444', // Merah peringatan / tombol Hapus
  dangerLight: '#FEF2F2',
  dangerDark: '#DC2626',
  success: '#10B981', // Hijau indikator sukses
  successLight: '#ECFDF5',
  warning: '#F59E0B',

  // Elemen Khusus
  radioActive: '#0F172A', // Titik hitam/pekat radio button sesuai mockup
  radioInactive: '#CBD5E1',

  // Identitas Warna Fakultas UBD (Modern Badges & Accents)
  faculty: {
    saintek: '#0284C7', // Sky Tech
    saintekLight: '#E0F2FE',
    bisnis: '#0D9488', // Teal Finance
    bisnisLight: '#CCFBF1',
    komunikasi: '#7C3AED', // Violet Creative
    komunikasiLight: '#EDE9FE',
    soshum: '#D97706', // Amber Humaniora
    soshumLight: '#FEF3C7',
  },

  // Gradient Presets
  gradients: {
    primary: ['#1E3A8A', '#2563EB', '#3B82F6'] as const,
    primaryDark: ['#0F172A', '#1E3A8A', '#2563EB'] as const,
    heroLogin: ['#0F172A', '#1E293B', '#1E3A8A'] as const,
    cardSaintek: ['#0284C7', '#0EA5E9'] as const,
    cardBisnis: ['#0D9488', '#14B8A6'] as const,
    cardKomunikasi: ['#7C3AED', '#8B5CF6'] as const,
    cardSoshum: ['#D97706', '#F59E0B'] as const,
    bannerPulse: ['rgba(37, 99, 235, 0.95)', 'rgba(30, 58, 138, 0.95)'] as const,
    tabIndicator: ['#2563EB', '#3B82F6'] as const,
  },
} as const;

export type ColorKey = keyof typeof colors;
