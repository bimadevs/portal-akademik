import React, { useCallback, useMemo, useState } from 'react';
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
import { colors, fonts, radius, shadows, spacing } from '@/theme';

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
      'Konfirmasi Keluar',
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

  // Sapaan kontekstual berdasarkan waktu
  const greetingText = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 11) return 'Selamat pagi';
    if (hours < 15) return 'Selamat siang';
    if (hours < 18) return 'Selamat sore';
    return 'Selamat malam';
  }, []);

  // 3 mahasiswa terbaru untuk preview spotlight
  const recentStudents = mahasiswaList.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header Resmi UBD */}
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
        {/* Executive Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greetingTitle}>
            {greetingText},{' '}
            {userSession?.username ? userSession.username.toUpperCase() : 'ADMIN'}
          </Text>
          <Text style={styles.greetingSubtitle}>
            Sistem Informasi Akademik Terpadu Universitas Buddhi Dharma
          </Text>
        </View>

        {/* Quick Executive Stats (Berakar dari Palet Resmi UBD) */}
        <View style={styles.statsRow}>
          {/* Stat 1: Total Mahasiswa (Biru UBD / Master Data) */}
          <Pressable
            onPress={() => router.push('/(tabs)/report')}
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.statIconBadge, { backgroundColor: colors.section.masterBg }]}>
              <Ionicons name="people" size={17} color={colors.section.master} />
            </View>
            <Text style={styles.statNumber} numberOfLines={1}>
              {mahasiswaList.length}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Mahasiswa
            </Text>
          </Pressable>

          {/* Stat 2: Total Fakultas (Saffron UBD / Operasional) */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: colors.section.operasionalBg }]}>
              <Ionicons name="business" size={17} color={colors.section.operasional} />
            </View>
            <Text style={styles.statNumber} numberOfLines={1}>
              4
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Fakultas
            </Text>
          </View>

          {/* Stat 3: Mode Offline-First (Crimson UBD / Keandalan) */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: colors.section.penilaianBg }]}>
              <Ionicons name="server" size={17} color={colors.section.penilaian} />
            </View>
            <Text style={styles.statNumber} numberOfLines={1}>
              100%
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Offline Relasional
            </Text>
          </View>
        </View>

        {/* Banner Identitas Kampus */}
        <View style={styles.sectionBlock}>
          <CampusBanner />
        </View>

        {/* Direktori Layanan Akademik */}
        <View style={styles.sectionBlock}>
          <AcademicGrid />
        </View>

        {/* Recent Student Data Spotlight */}
        <View style={styles.sectionBlock}>
          <View style={styles.spotlightHeader}>
            <View style={styles.spotlightTitleCol}>
              <Text style={styles.spotlightTitle}>Registrasi Terakhir</Text>
              <Text style={styles.spotlightSubtitle}>
                Mahasiswa yang baru terdaftar dalam basis data
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/report')}
              hitSlop={8}
              style={({ pressed }) => [
                styles.viewAllButton,
                pressed && styles.viewAllButtonPressed,
              ]}
            >
              <Text style={styles.viewAllText}>Semua</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.primary} />
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
                  size={40}
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
                <Ionicons name="folder-open-outline" size={28} color={colors.textMuted} />
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 24,
    gap: spacing.lg,
  },
  welcomeSection: {
    gap: 4,
    paddingHorizontal: 2,
  },
  greetingTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 21,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: 3,
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionBlock: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  spotlightTitleCol: {
    gap: 2,
  },
  spotlightTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  spotlightSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  viewAllButtonPressed: {
    backgroundColor: colors.primaryBorder,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  spotlightList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.sm,
  },
  spotlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentNim: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  facultyTag: {
    backgroundColor: colors.surfaceSubtle,
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
    gap: spacing.xs,
  },
  emptySpotlightText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
