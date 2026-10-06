import { Alert, LogBox, Platform } from 'react-native';

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

// 3. Polyfill Alert.alert for Web environment (react-native-web has empty stub)
if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const text = [title, message].filter(Boolean).join('\n');
    if (!buttons || buttons.length === 0) {
      if (typeof window !== 'undefined') window.alert(text);
      return;
    }
    if (buttons.length === 1) {
      if (typeof window !== 'undefined') window.alert(text);
      buttons[0].onPress?.();
      return;
    }
    const confirmed = typeof window !== 'undefined' ? window.confirm(text) : true;
    if (confirmed) {
      const confirmBtn = buttons.find((b) => b.style !== 'cancel') || buttons[0];
      confirmBtn.onPress?.();
    } else {
      const cancelBtn = buttons.find((b) => b.style === 'cancel');
      cancelBtn?.onPress?.();
    }
  };
}
