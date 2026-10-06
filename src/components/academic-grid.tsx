import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/theme';

interface AcademicMenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  isPrimary?: boolean;
  badge?: string;
  onPress: () => void;
}

export function AcademicGrid() {
  const router = useRouter();

  const menuSections: { title: string; subtitle: string; items: AcademicMenuItem[] }[] = [
    {
      title: 'Master Data Akademik',
      subtitle: 'Entri dan registrasi data pokok universitas',
      items: [
        {
          id: 'mahasiswa',
          title: 'Data Mahasiswa',
          subtitle: 'Registrasi & profil mahasiswa',
          iconName: 'school',
          iconBg: '#EFF6FF',
          iconColor: '#1E3A8A',
          isPrimary: true,
          badge: 'UTAMA',
          onPress: () => router.push('/(tabs)/mahasiswa'),
        },
        {
          id: 'dosen',
          title: 'Data Dosen',
          subtitle: 'Tenaga pengajar & NIDN',
          iconName: 'person-circle-outline',
          iconBg: '#E0F2FE',
          iconColor: '#0284C7',
          onPress: () => router.push('/dosen'),
        },
        {
          id: 'matkul',
          title: 'Mata Kuliah',
          subtitle: 'Kurikulum, silabus & SKS',
          iconName: 'book-outline',
          iconBg: '#EEF2FF',
          iconColor: '#4F46E5',
          onPress: () => router.push('/mata-kuliah'),
        },
      ],
    },
    {
      title: 'Operasional Perkuliahan',
      subtitle: 'Siklus perkuliahan semester aktif',
      items: [
        {
          id: 'jadwal',
          title: 'Jadwal Kuliah',
          subtitle: 'Alokasi ruang & sesi',
          iconName: 'calendar-outline',
          iconBg: '#CCFBF1',
          iconColor: '#0D9488',
          onPress: () => router.push('/jadwal'),
        },
        {
          id: 'krs',
          title: 'KRS Mahasiswa',
          subtitle: 'Rencana studi semester',
          iconName: 'document-text-outline',
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
          onPress: () => router.push('/krs'),
        },
        {
          id: 'presensi',
          title: 'Presensi Kelas',
          subtitle: 'Catatan kehadiran harian',
          iconName: 'checkbox-outline',
          iconBg: '#FFE4E6',
          iconColor: '#E11D48',
          onPress: () => router.push('/presensi'),
        },
      ],
    },
    {
      title: 'Penilaian & Administrasi',
      subtitle: 'Rekapitulasi capaian dan tata kelola sistem',
      items: [
        {
          id: 'prestasi',
          title: 'Prestasi & Nilai',
          subtitle: 'Input nilai & kalkulasi IPK',
          iconName: 'trophy-outline',
          iconBg: '#E0F2FE',
          iconColor: '#0369A1',
          onPress: () => router.push('/nilai'),
        },
        {
          id: 'kartu',
          title: 'Kartu Mahasiswa',
          subtitle: 'Digital KTM & QR verifikasi',
          iconName: 'id-card-outline',
          iconBg: '#EDE9FE',
          iconColor: '#7C3AED',
          onPress: () => router.push('/kartu'),
        },
        {
          id: 'laporan',
          title: 'Statistik & Laporan',
          subtitle: 'Grafik agregasi akademik',
          iconName: 'bar-chart-outline',
          iconBg: '#FFEDD5',
          iconColor: '#EA580C',
          onPress: () => router.push('/laporan'),
        },
        {
          id: 'pengaturan',
          title: 'Pengaturan Sistem',
          subtitle: 'Semester, backup & audit',
          iconName: 'settings-outline',
          iconBg: '#F1F5F9',
          iconColor: '#475569',
          onPress: () => router.push('/pengaturan'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {menuSections.map((section, sIdx) => (
        <View key={sIdx} style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTextCol}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{section.items.length} Menu</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.card,
                  item.isPrimary && styles.cardPrimary,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.iconName} size={20} color={item.iconColor} />
                  </View>

                  {item.badge ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>{item.badge}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                  )}
                </View>

                <View style={styles.cardContent}>
                  <Text
                    style={[
                      styles.cardTitle,
                      item.isPrimary && styles.cardTitlePrimary,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xl,
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  sectionTextCol: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  badgePill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.sm,
  },
  cardPrimary: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FAFCFF',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  cardTitlePrimary: {
    color: colors.primary,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
