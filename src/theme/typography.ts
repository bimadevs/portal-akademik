import { TextStyle } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';

export const typography = {
  display: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subhead: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stat: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;
