/**
 * Palet warna resmi Universitas Buddhi Dharma (UBD) "Teratai Merah"
 * Diturunkan langsung dari logo resmi UBD:
 * - Crimson Red: Mahkota bunga teratai & teks institusi (Warna Primer)
 * - Royal Blue: Stupa Borobudur & buku terbuka (Warna Sekunder & Master Data)
 * - Saffron Orange: Lingkaran tengah pembatas (Warna Operasional & Peringatan)
 * - Sun Gold: Sinar surya fajar (Warna Aksen Khusus & Highlight)
 * - Warm Stone: Kanvas hangat pengganti slate dingin
 */

export const palette = {
  // Merah Teratai UBD (Crimson Red)
  crimson: {
    50: '#FDF3F2',
    100: '#FBE4E2',
    200: '#F5C4C0',
    300: '#EB9993',
    400: '#DF665D',
    500: '#D0403A',
    600: '#B3202A', // Utama UBD
    700: '#931A22',
    800: '#72151B',
    900: '#4A0E12',
  },
  // Biru Stupa & Buku UBD (Royal Academic Blue)
  blue: {
    50: '#EEF3FB',
    100: '#DCE6F6',
    200: '#B9CCEC',
    300: '#8EADE0',
    400: '#5F8DD0',
    500: '#3A6BC0',
    600: '#2556A8', // Sekunder UBD
    700: '#1C4386',
    800: '#143163',
    900: '#0F2650',
  },
  // Jingga Saffron UBD (Ring Cincin Logo)
  saffron: {
    50: '#FFF6EB',
    100: '#FFE8CC',
    200: '#FCD09A',
    300: '#FAB463',
    400: '#F59E36',
    500: '#EE8A25',
    600: '#CF6F17',
    700: '#A3540F',
    800: '#7E3F0A',
    900: '#5A2C06',
  },
  // Emas Surya UBD (Sun Gold)
  gold: {
    50: '#FEFCE8',
    100: '#FEF4C7',
    200: '#FDE48B',
    300: '#FCD34E',
    400: '#F5C518',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },
  // Warm Stone (Netral Hangat Bebas Slate Dingin)
  stone: {
    0: '#FFFFFF',
    25: '#FCFBFA',
    50: '#FAF8F6',
    100: '#F4F1EE',
    200: '#E8E3DE',
    300: '#D6CFC8',
    400: '#A39A92',
    500: '#7A716A',
    600: '#57514C',
    700: '#443E3A',
    800: '#292524',
    900: '#1C1917',
  },
} as const;

export const colors = {
  // Warna Utama UBD (Teratai Crimson)
  primary: palette.crimson[600], // #B3202A
  primaryDark: palette.crimson[800], // #72151B
  primaryLight: palette.crimson[50], // #FDF3F2
  primaryHover: palette.crimson[700], // #931A22
  primaryAccent: palette.crimson[500], // #D0403A
  primaryBorder: palette.crimson[200], // #F5C4C0
  primarySoft: palette.crimson[200], // #F5C4C0
  onPrimaryMuted: palette.crimson[200], // #F5C4C0

  // Warna Sekunder UBD (Stupa & Buku Royal Blue)
  secondary: palette.blue[600], // #2556A8
  secondaryLight: palette.blue[50], // #EEF3FB
  secondaryDark: palette.blue[700], // #1C4386
  secondaryBorder: palette.blue[200], // #B9CCEC
  accent: palette.blue[600], // #2556A8
  accentLight: palette.blue[50], // #EEF3FB
  accentDark: palette.blue[700], // #1C4386
  accentBorder: palette.blue[200], // #B9CCEC

  // Highlight & Aksen Khusus (Sun Gold & Saffron)
  gold: palette.gold[400], // #F5C518
  highlight: palette.gold[400], // #F5C518
  highlightLight: palette.gold[100], // #FEF4C7
  saffron: palette.saffron[500], // #EE8A25
  saffronLight: palette.saffron[50], // #FFF6EB
  saffronDark: palette.saffron[600], // #CF6F17
  saffronBorder: palette.saffron[200], // #FCD09A

  // Latar Belakang & Permukaan
  background: palette.stone[50], // #FAF8F6
  surface: '#FFFFFF',
  surfaceSubtle: palette.stone[100], // #F4F1EE
  surfaceElevated: '#FFFFFF',

  // Teks & Kontras
  textPrimary: palette.stone[900], // #1C1917
  textSecondary: palette.stone[600], // #57514C
  textTertiary: palette.stone[400], // #A39A92
  textMuted: palette.stone[400],
  textOnPrimary: '#FFFFFF',

  // Garis Pemisah & Bingkai
  border: palette.stone[200], // #E8E3DE
  borderDefault: palette.stone[200],
  borderSubtle: palette.stone[100],
  borderFocus: palette.crimson[600],
  borderMuted: palette.stone[100],

  // Status & Indikator (Vermilion untuk bahaya agar terbedakan dari crimson institusional)
  danger: '#D7372A', // Vermilion warning
  dangerLight: '#FEF2F2',
  dangerDark: '#991B1B',
  dangerBorder: '#FECACA',
  success: '#1F8A5B', // Emerald kampus
  successLight: '#ECFDF5',
  successDark: '#065F46',
  successBorder: '#A7F3D0',
  warning: palette.saffron[600], // #CF6F17
  warningLight: palette.saffron[50],
  warningDark: palette.saffron[700],
  warningBorder: palette.saffron[200],
  info: palette.blue[600], // #2556A8
  infoLight: palette.blue[50],
  infoBorder: palette.blue[200],

  // Elemen Khusus
  radioActive: palette.crimson[600],
  radioInactive: palette.stone[300],

  // Kluster Kategori Modul Akademik
  section: {
    master: palette.blue[600],
    masterBg: palette.blue[50],
    masterBorder: palette.blue[200],
    operasional: palette.saffron[600],
    operasionalBg: palette.saffron[50],
    operasionalBorder: palette.saffron[200],
    penilaian: palette.crimson[600],
    penilaianBg: palette.crimson[50],
    penilaianBorder: palette.crimson[200],
  },

  // Identitas Warna Fakultas UBD (Harmoni Teratai UBD)
  faculty: {
    saintek: palette.blue[600], // UBD Blue
    saintekLight: palette.blue[50],
    bisnis: palette.saffron[600], // UBD Saffron
    bisnisLight: palette.saffron[50],
    komunikasi: '#9B2C5A', // UBD Lotus Plum
    komunikasiLight: '#FDF2F8',
    soshum: '#1F7A6B', // UBD Jade Teal
    soshumLight: '#F0FDF4',
  },
  faculties: {
    saintek: palette.blue[600],
    saintekLight: palette.blue[50],
    bisnis: palette.saffron[600],
    bisnisLight: palette.saffron[50],
    komunikasi: '#9B2C5A',
    komunikasiLight: '#FDF2F8',
    soshum: '#1F7A6B',
    soshumLight: '#F0FDF4',
  },

  // Gradient Presets
  gradients: {
    primary: [palette.crimson[800], palette.crimson[600]] as const,
    primarySubtle: [palette.crimson[50], palette.crimson[100]] as const,
    heroLogin: ['#4A0E12', '#931A22'] as const,
    cardSaintek: [palette.blue[700], palette.blue[500]] as const,
    cardBisnis: [palette.saffron[700], palette.saffron[500]] as const,
    cardKomunikasi: ['#781D43', '#9B2C5A'] as const,
    cardSoshum: ['#155348', '#1F7A6B'] as const,
    badgeSoft: [palette.stone[100], palette.stone[200]] as const,
    tabIndicator: [palette.crimson[600], palette.crimson[500]] as const,
    goldAccent: [palette.gold[400], palette.saffron[500]] as const,
  },
} as const;

export type ColorKey = keyof typeof colors;
