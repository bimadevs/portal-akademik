import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
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
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
} as const satisfies Record<string, TextStyle>;
