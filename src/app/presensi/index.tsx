import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { SemesterService } from '../../services/semester-service';
import { MataKuliah, Semester } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';

export default function PresensiMatkulListScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<MataKuliah[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const activeSem = await SemesterService.getActive();
      setSemester(activeSem);
      const data = await MataKuliahService.getAll();
      setCourses(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat mata kuliah');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        <Text style={styles.bannerText}>
          Pilih Mata Kuliah untuk Input Presensi ({semester?.nama || 'Semester Aktif'})
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <View style={styles.tagRow}>
                  <View style={styles.kodeBadge}>
                    <Text style={styles.kodeTag}>{item.kode}</Text>
                  </View>
                  <View style={styles.sksBadge}>
                    <Text style={styles.sksTag}>{item.sks} SKS</Text>
                  </View>
                </View>
                <Text style={styles.nama}>{item.nama}</Text>
                <View style={styles.dosenRow}>
                  <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.dosen}>{item.dosen_nama || 'Dosen Belum Ditugaskan'}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtnPrimary,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/presensi/checklist',
                      params: { mataKuliahId: item.id, nama: item.nama },
                    })
                  }
                >
                  <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnTextPrimary}>Catat Presensi</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtnOutline,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/presensi/rekap',
                      params: { mataKuliahId: item.id, nama: item.nama },
                    })
                  }
                >
                  <Ionicons name="stats-chart-outline" size={16} color={colors.primary} />
                  <Text style={styles.actionBtnTextOutline}>Rekap Kehadiran</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  bannerText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  info: {
    marginBottom: spacing.md,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  kodeBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  kodeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  sksBadge: {
    backgroundColor: colors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  sksTag: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  nama: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dosenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dosen: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  actionBtnTextOutline: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
