import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PresensiService, RekapPresensi } from '../../services/presensi-service';
import { SemesterService } from '../../services/semester-service';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { PDFService } from '../../services/pdf-service';
import { Semester, MataKuliah } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';

export default function PresensiRekapScreen() {
  const { mataKuliahId, nama } = useLocalSearchParams<{
    mataKuliahId: string;
    nama: string;
  }>();

  const [rekapList, setRekapList] = useState<RekapPresensi[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [mataKuliah, setMataKuliah] = useState<MataKuliah | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!mataKuliahId) return;
        const sem = await SemesterService.getActive();
        setSemester(sem);

        const mk = await MataKuliahService.getById(mataKuliahId);
        setMataKuliah(mk);

        if (sem) {
          const list = await PresensiService.getRekapByMataKuliah(mataKuliahId, sem.id);
          setRekapList(list);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Gagal memuat rekap presensi');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mataKuliahId]);

  const handleExportPDF = async () => {
    if (!mataKuliah || !semester) {
      Alert.alert('Perhatian', 'Informasi mata kuliah atau semester belum lengkap.');
      return;
    }

    if (rekapList.length === 0) {
      Alert.alert('Perhatian', 'Belum ada data kehadiran peserta untuk diekspor ke PDF.');
      return;
    }

    setPrinting(true);
    try {
      await PDFService.generatePresensiPdf({
        mataKuliah,
        rekapList,
        semester,
      });
    } catch (err: any) {
      Alert.alert('Gagal Ekspor', err.message || 'Terjadi kesalahan saat mengekspor Berita Acara Presensi.');
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.title}>Rekap Presensi Mahasiswa</Text>
          <Text style={styles.sub}>{mataKuliah?.nama || nama} ({mataKuliah?.kode || 'MK'})</Text>
          <Text style={styles.semText}>Semester: {semester?.nama || 'Semester Aktif'}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.exportBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={handleExportPDF}
          disabled={printing}
        >
          {printing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Ekspor PDF</Text>
            </>
          )}
        </Pressable>
      </View>

      <FlatList
        data={rekapList}
        keyExtractor={(item, index) => String(item.mahasiswa_id ?? index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>Belum ada data rekap presensi</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSafe = item.persentase >= 75;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentNama}>{item.nama || item.mahasiswa_nama}</Text>
                  <Text style={styles.studentNim}>NIM: {item.nim || item.mahasiswa_nim}</Text>
                </View>
                <View
                  style={[
                    styles.pctBadge,
                    {
                      backgroundColor: isSafe ? '#DCFCE7' : '#FEE2E2',
                      borderColor: isSafe ? '#BBF7D0' : '#FECACA',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pctText,
                      { color: isSafe ? '#166534' : '#991B1B' },
                    ]}
                  >
                    {item.persentase}% {isSafe ? 'Memenuhi' : '< 75%'}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.hadir}</Text>
                  <Text style={styles.statLabel}>Hadir</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.izin}</Text>
                  <Text style={styles.statLabel}>Izin</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.sakit}</Text>
                  <Text style={styles.statLabel}>Sakit</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.alpha ?? (item as any).alfa ?? 0}</Text>
                  <Text style={styles.statLabel}>Alfa</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.totalPertemuan ?? item.total_pertemuan ?? 0}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: spacing.md,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  semText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentNama: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentNim: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
