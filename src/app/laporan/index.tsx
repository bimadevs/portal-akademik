import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LaporanService, DashboardStats } from '../../services/laporan-service';
import { BarChart } from '../../components/bar-chart';
import { PieChart } from '../../components/pie-chart';
import { colors, radius, spacing, shadows, fonts } from '@/theme';

export default function LaporanScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await LaporanService.getDashboardStats();
      setStats(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const genderPieData = [
    {
      label: 'Laki-Laki',
      count: stats?.genderBreakdown.find((g) => g.jenisKelamin === 'PRIA')?.count || 0,
      color: colors.primary,
    },
    {
      label: 'Perempuan',
      count: stats?.genderBreakdown.find((g) => g.jenisKelamin === 'WANITA')?.count || 0,
      color: colors.accentDark,
    },
  ];

  const fakultasBarData = (stats?.fakultasBreakdown || []).map((f) => ({
    label: f.fakultas.replace('Fakultas ', ''),
    count: f.count,
    color: colors.primary,
  }));

  const gradePieData = [
    { label: 'A', count: stats?.gradeDistribution?.['A'] || 0, color: colors.success },
    { label: 'B', count: stats?.gradeDistribution?.['B'] || 0, color: colors.info },
    { label: 'C', count: stats?.gradeDistribution?.['C'] || 0, color: colors.warning },
    { label: 'D', count: stats?.gradeDistribution?.['D'] || 0, color: colors.saffronDark },
    { label: 'E', count: stats?.gradeDistribution?.['E'] || 0, color: colors.danger },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="people" size={18} color={colors.primary} />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalMahasiswa || 0}</Text>
          <Text style={styles.kpiLabel}>Total Mahasiswa</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: colors.secondaryLight }]}>
            <Ionicons name="person" size={18} color={colors.secondary} />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalDosen || 0}</Text>
          <Text style={styles.kpiLabel}>Dosen Pengajar</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: colors.saffronLight }]}>
            <Ionicons name="book" size={18} color={colors.saffronDark} />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalMataKuliah || 0}</Text>
          <Text style={styles.kpiLabel}>Mata Kuliah Aktif</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: colors.successLight }]}>
            <Ionicons name="calendar" size={18} color={colors.success} />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalJadwal || 0}</Text>
          <Text style={styles.kpiLabel}>Sesi Perkuliahan</Text>
        </View>
      </View>

      <PieChart data={genderPieData} title="Komposisi Gender Mahasiswa" />

      <BarChart data={fakultasBarData} title="Distribusi Mahasiswa per Fakultas" />

      <PieChart data={gradePieData} title="Distribusi Nilai Huruf Mahasiswa" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  kpiNum: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
