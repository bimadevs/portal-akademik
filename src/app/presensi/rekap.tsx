import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PresensiService, RekapPresensi } from '../../services/presensi-service';
import { SemesterService } from '../../services/semester-service';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { PDFService } from '../../services/pdf-service';
import { Semester, MataKuliah } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
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
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExportPDF}
          disabled={printing}
          activeOpacity={0.7}
        >
          {printing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Ekspor PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={rekapList}
        keyExtractor={(item, index) => String(item.mahasiswa_id ?? index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
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
                    { backgroundColor: isSafe ? '#DCFCE7' : '#FEE2E2' },
                  ]}
                >
                  <Text
                    style={[
                      styles.pctText,
                      { color: isSafe ? '#166534' : '#991B1B' },
                    ]}
                  >
                    {item.persentase}% {isSafe ? '(Memenuhi)' : '(< 75%)'}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  semText: {
    fontSize: 11,
    color: UBD_COLORS.ACCENT_DARK,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: UBD_COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentNama: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentNim: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
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
    color: '#64748B',
  },
});
