/**
 * Theme constants and bridge to centralized @/theme tokens.
 */

import { Platform } from 'react-native';
import { colors } from '../theme/colors';

export const Colors = {
  light: {
    text: colors.textPrimary,
    background: colors.background,
    backgroundElement: colors.surfaceSubtle,
    backgroundSelected: colors.primaryLight,
    textSecondary: colors.textSecondary,
  },
  dark: {
    text: '#ffffff',
    background: '#090D16',
    backgroundElement: '#131B2E',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * UBD_COLORS mapped directly to centralized @/theme tokens
 */
export const UBD_COLORS = {
  PRIMARY: colors.primary,
  PRIMARY_DARK: colors.primaryDark,
  PRIMARY_LIGHT: colors.primaryLight,
  ACCENT: colors.accent,
  ACCENT_DARK: colors.primaryDark,
  BACKGROUND: colors.background,
  SURFACE: colors.surface,
  TEXT: colors.textPrimary,
  TEXT_MUTED: colors.textSecondary,
  BORDER: colors.border,
  DANGER: colors.danger,
  SUCCESS: colors.success,
  WARNING: colors.warning,
};
