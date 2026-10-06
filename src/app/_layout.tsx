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
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colors.textPrimary,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Core Auth & Tabs */}
        <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />

        {/* Master Data: Dosen */}
        <Stack.Screen name="dosen/index" options={{ title: 'Data Dosen', headerShown: true }} />
        <Stack.Screen name="dosen/form" options={{ title: 'Formulir Dosen', headerShown: true }} />
        <Stack.Screen name="dosen/[id]" options={{ title: 'Detail Dosen', headerShown: true }} />

        {/* Master Data: Mata Kuliah */}
        <Stack.Screen name="mata-kuliah/index" options={{ title: 'Mata Kuliah', headerShown: true }} />
        <Stack.Screen name="mata-kuliah/form" options={{ title: 'Formulir Mata Kuliah', headerShown: true }} />
        <Stack.Screen name="mata-kuliah/[id]" options={{ title: 'Detail Mata Kuliah', headerShown: true }} />

        {/* Operasional: Jadwal Kuliah */}
        <Stack.Screen name="jadwal/index" options={{ title: 'Jadwal Kuliah', headerShown: true }} />
        <Stack.Screen name="jadwal/form" options={{ title: 'Formulir Jadwal', headerShown: true }} />

        {/* Operasional: KRS */}
        <Stack.Screen name="krs/index" options={{ title: 'KRS Mahasiswa', headerShown: true }} />
        <Stack.Screen name="krs/[mahasiswaId]" options={{ title: 'Pengambilan KRS', headerShown: true }} />

        {/* Operasional: Presensi */}
        <Stack.Screen name="presensi/index" options={{ title: 'Presensi Kelas', headerShown: true }} />
        <Stack.Screen name="presensi/checklist" options={{ title: 'Catat Presensi', headerShown: true }} />
        <Stack.Screen name="presensi/rekap" options={{ title: 'Rekap Presensi', headerShown: true }} />

        {/* Akademik: Prestasi & Nilai */}
        <Stack.Screen name="nilai/index" options={{ title: 'Prestasi & Nilai', headerShown: true }} />
        <Stack.Screen name="nilai/[mahasiswaId]" options={{ title: 'Input Nilai & Transkrip', headerShown: true }} />

        {/* Pelaporan & Statistik */}
        <Stack.Screen name="laporan/index" options={{ title: 'Statistik & Laporan', headerShown: true }} />

        {/* Kartu Mahasiswa Digital */}
        <Stack.Screen name="kartu/index" options={{ title: 'Kartu Mahasiswa Digital', headerShown: true }} />
        <Stack.Screen name="kartu/[mahasiswaId]" options={{ title: 'KTM Mahasiswa UBD', headerShown: true }} />

        {/* Pengaturan Sistem & Audit Log */}
        <Stack.Screen name="pengaturan/index" options={{ title: 'Pengaturan Sistem', headerShown: true }} />
        <Stack.Screen name="pengaturan/audit-log" options={{ title: 'Audit Log Administratif', headerShown: true }} />
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
