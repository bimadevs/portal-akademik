import '@/utils/ignore-warnings';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { colors } from '@/theme';

function RootNavigationLayout() {
  const { userSession, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Gunakan macrotask timer agar NavigationContainer dan fiber tree telah mounted sepenuhnya
    const timer = setTimeout(() => {
      const inTabsGroup = segments[0] === '(tabs)';

      if (!userSession && inTabsGroup) {
        // Belum login namun mencoba akses tabs -> redirect ke login
        router.replace('/login');
      } else if (userSession && segments[0] === 'login') {
        // Sesi aktif namun masih di layar login -> redirect ke dashboard
        router.replace('/(tabs)');
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [userSession, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigationLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
