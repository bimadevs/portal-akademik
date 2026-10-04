/**
 * Test Environment Setup for Portal Akademik UBD E2E Tests
 * Configures global mocks for React Native, Expo SQLite, and Expo Router.
 */

import { mock } from 'bun:test';
import { testDbShim } from './test-db';

// In-memory key-value store for AsyncStorage fallback
const memoryStorage = new Map<string, string>();

export const mockAsyncStorage = {
  getItem: async (key: string) => memoryStorage.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
  },
  clear: async () => {
    memoryStorage.clear();
  },
  getAllKeys: async () => Array.from(memoryStorage.keys()),
};

export const mockNavigation = {
  currentRoute: '/login',
  history: [] as string[],
  push: (route: string) => {
    mockNavigation.history.push(mockNavigation.currentRoute);
    mockNavigation.currentRoute = route;
  },
  replace: (route: string) => {
    mockNavigation.currentRoute = route;
  },
  back: () => {
    const prev = mockNavigation.history.pop();
    if (prev) mockNavigation.currentRoute = prev;
  },
  dismissAll: () => {
    mockNavigation.history = [];
  },
  reset: () => {
    mockNavigation.currentRoute = '/login';
    mockNavigation.history = [];
  },
};

// 1. Mock expo-sqlite with our SQLite in-memory engine
mock.module('expo-sqlite', () => ({
  openDatabaseAsync: async () => testDbShim,
}));

// 2. Mock react-native
mock.module('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (obj: Record<string, any>) => obj.android ?? obj.default,
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => {
      // Record alerts for testing verification
      mockAlerts.push({ title, message, buttons });
    },
  },
  BackHandler: {
    exitApp: () => {
      mockBackHandler.exitAppCalled = true;
    },
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
  },
  AppState: {
    currentState: 'active',
    addEventListener: () => ({ remove: () => {} }),
  },
  LogBox: {
    ignoreLogs: () => {},
    ignoreAllLogs: () => {},
  },
}));

// 3. Mock @react-native-async-storage/async-storage
mock.module('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

// 4. Mock expo-router
mock.module('expo-router', () => ({
  useRouter: () => mockNavigation,
  router: mockNavigation,
  useSegments: () => [mockNavigation.currentRoute.replace(/^\//, '')],
  useLocalSearchParams: () => ({}),
  Link: () => null,
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
}));

// 5. Mock @expo/vector-icons
mock.module('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  FontAwesome: () => null,
}));

// 6. Mock expo-crypto
mock.module('expo-crypto', () => ({
  randomUUID: () => crypto.randomUUID(),
}));

// 7. Mock expo-print
export const mockExpoPrint = {
  lastPrintedHtml: '',
  printToFileAsync: async ({ html }: { html: string }) => {
    mockExpoPrint.lastPrintedHtml = html;
    return { uri: 'file:///mock/document.pdf', numberOfPages: 1 };
  },
  printAsync: async ({ html }: { html: string }) => {
    mockExpoPrint.lastPrintedHtml = html;
  },
};
mock.module('expo-print', () => mockExpoPrint);

// 8. Mock expo-sharing
export const mockExpoSharing = {
  lastSharedUrl: '',
  isAvailableAsync: async () => true,
  shareAsync: async (url: string, options?: any) => {
    mockExpoSharing.lastSharedUrl = url;
  },
};
mock.module('expo-sharing', () => mockExpoSharing);

// 9. Mock expo-file-system
export const mockExpoFileSystem = {
  cacheDirectory: 'file:///mock/cache/',
  lastWrittenFile: '',
  lastWrittenContent: '',
  writeAsStringAsync: async (path: string, contents: string, options?: any) => {
    mockExpoFileSystem.lastWrittenFile = path;
    mockExpoFileSystem.lastWrittenContent = contents;
  },
  readAsStringAsync: async (path: string) => '',
  EncodingType: { UTF8: 'utf8' },
};
mock.module('expo-file-system/legacy', () => mockExpoFileSystem);
mock.module('expo-file-system', () => ({
  File: {
    pickFileAsync: async () => ({ canceled: true }),
  },
  Directory: {},
  Paths: {},
}));

export const mockAlerts: Array<{ title: string; message?: string; buttons?: any[] }> = [];
export const mockBackHandler = { exitAppCalled: false };

export function clearMockHistory() {
  memoryStorage.clear();
  mockNavigation.reset();
  mockAlerts.length = 0;
  mockBackHandler.exitAppCalled = false;
  mockExpoPrint.lastPrintedHtml = '';
  mockExpoSharing.lastSharedUrl = '';
  mockExpoFileSystem.lastWrittenFile = '';
  mockExpoFileSystem.lastWrittenContent = '';
}
