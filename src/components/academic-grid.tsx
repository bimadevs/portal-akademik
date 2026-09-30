import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/theme';

interface AcademicMenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string];
  isPrimary?: boolean;
  badge?: string;
  onPress?: () => void;
}

export function AcademicGrid() {
  const router = useRouter();

  const handleUnderDevelopment = (featureName: string) => {
    Alert.alert(
      'Informasi Sistem',
      `Fitur ${featureName} sedang dalam tahap pengembangan.`,
      [{ text: 'Mengerti', style: 'default' }]
    );
  };

  const menuItems: AcademicMenuItem[] = [
    {
      id: 'mahasiswa',
      title: 'Data Mahasiswa',
      subtitle: 'Input & rekap data',
      iconName: 'school',
      gradientColors: ['#2563EB', '#1D4ED8'],
      isPrimary: true,
      badge: 'UTAMA',
      onPress: () => {
        router.push('/(tabs)/mahasiswa');
      },
    },
    {
      id: 'dosen',
      title: 'Jadwal Kuliah',
      subtitle: 'Jadwal kelas & dosen',
      iconName: 'calendar',
      gradientColors: ['#059669', '#047857'],
      onPress: () => handleUnderDevelopment('Jadwal Kuliah / Dosen'),
    },
    {
      id: 'krs',
      title: 'KRS / Dokumen',
      subtitle: 'Rencana studi digital',
      iconName: 'document-text',
      gradientColors: ['#D97706', '#B45309'],
      onPress: () => handleUnderDevelopment('KRS / Dokumen'),
    },
    {
      id: 'kartu',
      title: 'Kartu Mahasiswa',
      subtitle: 'Digital Student ID',
      iconName: 'id-card',
      gradientColors: ['#7C3AED', '#6D28D9'],
      onPress: () => handleUnderDevelopment('Kartu Mahasiswa'),
    },
    {
      id: 'presensi',
      title: 'Presensi Kampus',
      subtitle: 'Catatan kehadiran',
      iconName: 'checkbox',
      gradientColors: ['#E11D48', '#BE123C'],
      onPress: () => handleUnderDevelopment('Presensi & Catatan'),
    },
    {
      id: 'prestasi',
      title: 'Prestasi & IPK',
      subtitle: 'Portofolio akademik',
      iconName: 'trophy',
      gradientColors: ['#0284C7', '#0369A1'],
      onPress: () => handleUnderDevelopment('Prestasi Akademik'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Layanan Akademik</Text>
          <Text style={styles.sectionSubtitle}>Akses modul terintegrasi kampus UBD</Text>
        </View>
        <View style={styles.servicePill}>
          <Text style={styles.servicePillText}>6 Modul</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {[0, 2, 4].map((startIndex) => {
          const rowItems = menuItems.slice(startIndex, startIndex + 2);
          return (
            <View key={startIndex} style={styles.gridRow}>
              {rowItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.menuCard,
                    item.isPrimary && styles.menuCardPrimary,
                    pressed && styles.menuCardPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  {/* Top row with Icon and Optional Badge */}
                  <View style={styles.cardTopRow}>
                    <LinearGradient
                      colors={item.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradientBox}
                    >
                      <Ionicons name={item.iconName} size={22} color="#FFFFFF" />
                    </LinearGradient>

                    {item.badge ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>{item.badge}</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    )}
                  </View>

                  {/* Title & Subtitle */}
                  <View style={styles.cardTextContainer}>
                    <Text
                      style={[
                        styles.menuTitle,
                        item.isPrimary && styles.menuTitlePrimary,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.menuSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  servicePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  servicePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  gridContainer: {
    gap: spacing.md,
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  menuCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    boxShadow: shadows.card,
    gap: spacing.sm,
  },
  menuCardPrimary: {
    borderColor: '#93C5FD',
    backgroundColor: '#F8FAFC',
    boxShadow: shadows.raised,
  },
  menuCardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.88,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconGradientBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.subtle,
  },
  primaryBadge: {
    backgroundColor: '#EFF6FF',
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
  cardTextContainer: {
    marginTop: 2,
    gap: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  menuTitlePrimary: {
    color: colors.primary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});

