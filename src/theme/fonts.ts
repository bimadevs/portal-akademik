import { Platform } from 'react-native';

export const fontFamilies = {
  displaySemiBold: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  displayExtraBold: 'BricolageGrotesque_800ExtraBold',
} as const;

export const fonts = {
  display: Platform.select({
    ios: fontFamilies.displayBold,
    android: fontFamilies.displayBold,
    default: fontFamilies.displayBold,
  }),
  displayBold: Platform.select({
    ios: fontFamilies.displayBold,
    android: fontFamilies.displayBold,
    default: fontFamilies.displayBold,
  }),
  displaySemiBold: Platform.select({
    ios: fontFamilies.displaySemiBold,
    android: fontFamilies.displaySemiBold,
    default: fontFamilies.displaySemiBold,
  }),
  displayExtraBold: Platform.select({
    ios: fontFamilies.displayExtraBold,
    android: fontFamilies.displayExtraBold,
    default: fontFamilies.displayExtraBold,
  }),
  body: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'normal',
  }),
} as const;
