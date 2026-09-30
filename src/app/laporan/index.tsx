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
import { UBD_COLORS } from '../../constants/theme';

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  const genderPieData = [
    {
      label: 'Laki-Laki',
      count: stats?.genderBreakdown.find((g) => g.jenisKelamin === 'PRIA')?.count || 0,
      color: '#0284C7',
    },
    {
      label: 'Perempuan',
      count: stats?.genderBreakdown.find((g) => g.jenisKelamin === 'WANITA')?.count || 0,
      color: '#EC4899',
    },
  ];

  const fakultasBarData = (stats?.fakultasBreakdown || []).map((f) => ({
    label: f.fakultas.replace('Fakultas ', ''),
    count: f.count,
    color: UBD_COLORS.PRIMARY,
  }));

  const gradePieData = [
    { label: 'A', count: stats?.gradeDistribution?.['A'] || 0, color: '#16A34A' },
    { label: 'B', count: stats?.gradeDistribution?.['B'] || 0, color: '#0284C7' },
    { label: 'C', count: stats?.gradeDistribution?.['C'] || 0, color: '#E5A823' },
    { label: 'D', count: stats?.gradeDistribution?.['D'] || 0, color: '#F97316' },
    { label: 'E', count: stats?.gradeDistribution?.['E'] || 0, color: '#DC2626' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="people" size={20} color="#0284C7" />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalMahasiswa || 0}</Text>
          <Text style={styles.kpiLabel}>Mahasiswa</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="person" size={20} color="#D97706" />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalDosen || 0}</Text>
          <Text style={styles.kpiLabel}>Dosen</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="book" size={20} color="#16A34A" />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalMataKuliah || 0}</Text>
          <Text style={styles.kpiLabel}>Mata Kuliah</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="calendar" size={20} color="#9333EA" />
          </View>
          <Text style={styles.kpiNum}>{stats?.totalJadwal || 0}</Text>
          <Text style={styles.kpiLabel}>Sesi Kuliah</Text>
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
