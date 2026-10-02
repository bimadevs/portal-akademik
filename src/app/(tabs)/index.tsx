import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AcademicGrid } from '@/components/academic-grid';
import { CampusBanner } from '@/components/campus-banner';
import { UBDHeader } from '@/components/ubd-header';
import { PhotoAvatar } from '@/components/photo-avatar';
import { useAuth } from '@/context/auth-context';
import { StorageService } from '@/services/storage';
import { Mahasiswa } from '@/types/mahasiswa';
import { colors, radius, shadows, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, userSession } = useAuth();

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const list = await StorageService.getMahasiswaList();
      setMahasiswaList(list);
    } catch (e) {
      console.error('Error memuat data beranda:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari sesi administrator?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // 3 mahasiswa terbaru untuk preview spotlight
  const recentStudents = mahasiswaList.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header Resmi UBD dengan Tombol Logout & Pengaturan */}
      <UBDHeader
        showLogout
        onLogout={handleLogout}
        showSettings
        onSettings={() => router.push('/pengaturan')}
        variant="elevated"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Personalized Welcome Banner */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextColumn}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>PORTAL ONLINE • AKTIF</Text>
            </View>
            <Text style={styles.greetingTitle}>
              Halo, {userSession?.username ?? 'Administrator'} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              Kelola data akademik mahasiswa Universitas Buddhi Dharma
            </Text>
          </View>
        </View>

        {/* Quick Bento Stats Bar */}
        <View style={styles.statsRow}>
          {/* Stat 1: Total Mahasiswa */}
          <Pressable
            onPress={() => router.push('/(tabs)/report')}
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statNumber} numberOfLines={1}>
              {mahasiswaList.length}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">
              Mahasiswa
            </Text>
          </Pressable>

          {/* Stat 2: Total Fakultas */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="business" size={18} color="#16A34A" />
            </View>
            <Text style={styles.statNumber} numberOfLines={1}>
              4
            </Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">
              Fakultas
            </Text>
          </View>

          {/* Stat 3: Mode Offline-First */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#FAF5FF' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#9333EA" />
            </View>
            <Text style={styles.statNumber} numberOfLines={1}>
              100%
            </Text>
            <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">
              Offline
            </Text>
          </View>
        </View>

        {/* Banner Media Kampus [GIF] Bergradien */}
        <View style={styles.sectionBlock}>
          <CampusBanner />
        </View>

        {/* 6 Grid Menu Layanan Akademik */}
        <View style={styles.sectionBlock}>
          <AcademicGrid />
        </View>

        {/* Recent Student Data Spotlight Preview */}
        <View style={styles.sectionBlock}>
          <View style={styles.spotlightHeader}>
            <View>
              <Text style={styles.spotlightTitle}>Mahasiswa Terdaftar</Text>
              <Text style={styles.spotlightSubtitle}>
                Data terbaru dalam sistem akademik
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/report')}
              hitSlop={8}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Lihat Semua</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.spotlightList}>
            {recentStudents.map((m) => (
              <Pressable
                key={m.nim}
                onPress={() => router.push('/(tabs)/report')}
                style={({ pressed }) => [
                  styles.spotlightItem,
                  pressed && styles.cardPressed,
                ]}
              >
                <PhotoAvatar
                  uri={m.fotoUrl || (m as any).foto_url}
                  size={42}
                  name={m.nama}
                  shape="rounded"
                />

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {m.nama}
                  </Text>
                  <Text style={styles.studentNim}>NIM: {m.nim}</Text>
                </View>

                <View style={styles.facultyTag}>
                  <Text style={styles.facultyTagText} numberOfLines={1}>
                    {m.fakultas}
                  </Text>
                </View>
              </Pressable>
            ))}

            {recentStudents.length === 0 && (
              <View style={styles.emptySpotlight}>
                <Text style={styles.emptySpotlightText}>
                  Belum ada data mahasiswa terdaftar.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 20,
    gap: spacing.lg,
  },
  welcomeSection: {
    paddingTop: spacing.xs,
  },
  welcomeTextColumn: {
    gap: 4,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    boxShadow: shadows.card,
    gap: 3,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionBlock: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  spotlightTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  spotlightSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  spotlightList: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    boxShadow: shadows.card,
    gap: spacing.sm,
  },
  spotlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentNim: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  facultyTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    maxWidth: 110,
  },
  facultyTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySpotlight: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptySpotlightText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

