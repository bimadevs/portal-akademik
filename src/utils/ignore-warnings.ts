import { LogBox } from 'react-native';

const IGNORED_WARNINGS = [
  "Can't perform a React state update on a component that hasn't mounted yet",
  'ProgressBarAndroid has been extracted from react-native core',
  'SafeAreaView has been deprecated and will be removed in a future release',
  'Clipboard has been extracted from react-native core',
  'InteractionManager has been deprecated and will be removed in a future release',
  'PushNotificationIOS has been extracted from react-native core',
];

// 1. Daftarkan pola warning ke LogBox (Overlay UI pada simulator/device)
LogBox.ignoreLogs(IGNORED_WARNINGS);

// 2. Intercept console.warn untuk mencegah log deprecation Lean Core mencemari terminal Metro CLI
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (IGNORED_WARNINGS.some((pattern) => message.includes(pattern))) {
    return;
  }
  originalWarn(...args);
};
