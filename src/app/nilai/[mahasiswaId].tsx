import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { SemesterService } from '../../services/semester-service';
import { KRSService } from '../../services/krs-service';
import { NilaiService } from '../../services/nilai-service';
import { AcademicRulesService, AttendanceEligibility } from '../../services/academic-rules-service';
import { PDFService } from '../../services/pdf-service';
import { Mahasiswa, Semester, Nilai, KRS } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';

export default function NilaiDetailScreen() {
  const { mahasiswaId } = useLocalSearchParams<{ mahasiswaId: string }>();

  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [krsList, setKrsList] = useState<KRS[]>([]);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [ipsData, setIpsData] = useState<{ totalSks: number; ips: number }>({ totalSks: 0, ips: 0 });
  const [ipkValue, setIpkValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // V3 Attendance Eligibility Map: key = mata_kuliah_id
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEligibility>>({});

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedKrs, setSelectedKrs] = useState<KRS | null>(null);
  const [tugas, setTugas] = useState('0');
  const [uts, setUts] = useState('0');
  const [uas, setUas] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        if (!mahasiswaId) return;
        const m = await MahasiswaService.getById(mahasiswaId);
        const sem = await SemesterService.getActive();
        if (ignore) return;
        setMahasiswa(m);
        setSemester(sem);

        if (sem && m) {
          const krs = await KRSService.getByMahasiswaAndSemester(m.id, sem.id);
          const nilai = await NilaiService.getByMahasiswaAndSemester(m.id, sem.id);
          const ips = await NilaiService.hitungIPS(m.id, sem.id);
          const transcript = await NilaiService.getTranskrip(m.id);

          const attMap: Record<string, AttendanceEligibility> = {};
          for (const item of krs) {
            const mkId = item.mata_kuliah_id ?? item.mataKuliahId;
            if (mkId !== undefined) {
              const eligibility = await AcademicRulesService.checkAttendanceEligibility(m.id, mkId, sem.id);
              attMap[String(mkId)] = eligibility;
            }
          }

          if (!ignore) {
            setKrsList(krs);
            setNilaiList(nilai);
            setIpsData(ips);
            setIpkValue(transcript.ipk);
            setAttendanceMap(attMap);
          }
        }
      } catch (err: any) {
        if (!ignore) {
          Alert.alert('Error', err.message || 'Gagal memuat data nilai');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void init();
    return () => {
      ignore = true;
    };
  }, [mahasiswaId, refreshKey]);

  const openGradeModal = (krs: KRS) => {
    setSelectedKrs(krs);
    const mkId = krs.mata_kuliah_id ?? krs.mataKuliahId;
    const existing = nilaiList.find((n) => (n.mata_kuliah_id ?? (n as any).mataKuliahId) === mkId);
    if (existing) {
      setTugas(String(existing.tugas ?? 0));
      setUts(String(existing.uts ?? 0));
      setUas(String(existing.uas ?? 0));
    } else {
      setTugas('0');
      setUts('0');
      setUas('0');
    }
    setModalVisible(true);
  };

  const executeSaveGrade = async (t: number, m: number, a: number, mkId: string | number) => {
    if (!semester || !mahasiswa) return;
    setSaving(true);
    try {
      await NilaiService.saveNilai({
        mahasiswa_id: mahasiswa.id,
        mata_kuliah_id: mkId,
        semester_id: semester.id,
        tugas: t,
        uts: m,
        uas: a,
      });

      setModalVisible(false);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat menyimpan nilai');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedKrs || !semester || !mahasiswa) return;

    const t = parseFloat(tugas);
    const m = parseFloat(uts);
    const a = parseFloat(uas);

    if (isNaN(t) || isNaN(m) || isNaN(a) || t < 0 || t > 100 || m < 0 || m > 100 || a < 0 || a > 100) {
      Alert.alert('Peringatan', 'Nilai harus berupa angka antara 0 sampai 100!');
      return;
    }

    const mkId = selectedKrs.mata_kuliah_id ?? selectedKrs.mataKuliahId;
    if (mkId === undefined) return;

    // V3 Attendance Check: Alert if attendance rate < 75%
    const attendance = attendanceMap[String(mkId)];
    if (attendance && !attendance.isEligible) {
      Alert.alert(
        'Peringatan Kehadiran',
        `Mahasiswa ini memiliki persentase kehadiran ${attendance.persentase}% (di bawah batas minimum 75%). Apakah Anda yakin tetap ingin menyimpan evaluasi nilai akhir?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Tetap Simpan',
            onPress: () => executeSaveGrade(t, m, a, mkId),
          },
        ]
      );
      return;
    }

    await executeSaveGrade(t, m, a, mkId);
  };

  const handlePrintPDF = async () => {
    if (!mahasiswa || !semester) return;

    if (nilaiList.length === 0) {
      Alert.alert('Perhatian', 'Belum ada catatan nilai untuk dicetak ke berkas KHS.');
      return;
    }

    setPrinting(true);
    try {
      await PDFService.generateKHSPdf({
        mahasiswa,
        nilaiList,
        semester,
        ips: ipsData.ips,
        ipk: ipkValue,
        totalSks: ipsData.totalSks,
      });
    } catch (err: any) {
      Alert.alert('Gagal Cetak KHS', err.message || 'Terjadi kesalahan saat mencetak berkas PDF.');
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

  const selectedMkId = selectedKrs ? (selectedKrs.mata_kuliah_id ?? selectedKrs.mataKuliahId) : null;
  const selectedAttendance = selectedMkId ? attendanceMap[String(selectedMkId)] : null;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.nama}>{mahasiswa?.nama}</Text>
          <Text style={styles.nim}>NIM: {mahasiswa?.nim} • {mahasiswa?.fakultas}</Text>
          <Text style={styles.sem}>{semester?.nama}</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.ipsBadge}>
            <Text style={styles.ipsNum}>{ipsData.ips.toFixed(2)}</Text>
            <Text style={styles.ipsLabel}>IPS ({ipsData.totalSks} SKS)</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.printBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={handlePrintPDF}
            disabled={printing}
          >
            {printing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="print-outline" size={15} color="#FFFFFF" />
                <Text style={styles.printBtnText}>Cetak KHS</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={krsList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Mahasiswa belum mengambil KRS pada semester ini</Text>
          </View>
        }
        renderItem={({ item }) => {
          const mkId = item.mata_kuliah_id ?? item.mataKuliahId;
          const grade = nilaiList.find((n) => (n.mata_kuliah_id ?? (n as any).mataKuliahId) === mkId);
          const attendance = mkId !== undefined ? attendanceMap[String(mkId)] : null;
          const isAttendanceLow = attendance && !attendance.isEligible;

          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => openGradeModal(item)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.kodePill}>
                    <Text style={styles.kode}>{item.mata_kuliah_kode || item.kode}</Text>
                  </View>
                  {isAttendanceLow && (
                    <View style={styles.warningPill}>
                      <Ionicons name="warning-outline" size={12} color="#DC2626" />
                      <Text style={styles.warningPillText}>
                        Kehadiran {attendance.persentase}% (&lt; 75%)
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.matkul}>{item.mata_kuliah_nama || item.nama}</Text>
                <Text style={styles.sks}>{item.mata_kuliah_sks || item.sks} SKS</Text>
              </View>

              <View style={styles.cardRight}>
                {grade ? (
                  <View style={styles.gradeBox}>
                    <Text style={styles.huruf}>{grade.huruf || grade.nilaiHuruf}</Text>
                    <Text style={styles.angka}>
                      {grade.akhir ?? grade.nilaiAngka} ({((grade.bobot ?? 0)).toFixed(1)})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyGradeBox}>
                    <Text style={styles.emptyGradeText}>Input Nilai</Text>
                  </View>
                )}
                <Ionicons name="create-outline" size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          );
        }}
      />

      {/* Grade Input Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Input Nilai Mahasiswa</Text>
            <Text style={styles.modalSub}>
              {selectedKrs?.mata_kuliah_nama || selectedKrs?.nama}
            </Text>

            {/* Attendance warning in modal if low */}
            {selectedAttendance && !selectedAttendance.isEligible && (
              <View style={styles.modalWarningBox}>
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text style={styles.modalWarningText}>
                  Kehadiran {selectedAttendance.persentase}% (&lt; 75%). Memerlukan dispensasi untuk UAS.
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nilai Tugas (Bobot 30%)</Text>
              <TextInput
                style={styles.input}
                value={tugas}
                onChangeText={setTugas}
                keyboardType="numeric"
                placeholder="0 - 100"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nilai UTS (Bobot 30%)</Text>
              <TextInput
                style={styles.input}
                value={uts}
                onChangeText={setUts}
                keyboardType="numeric"
                placeholder="0 - 100"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nilai UAS (Bobot 40%)</Text>
              <TextInput
                style={styles.input}
                value={uas}
                onChangeText={setUas}
                keyboardType="numeric"
                placeholder="0 - 100"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSaveBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={handleSaveGrade}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan Nilai</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  nama: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nim: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sem: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  headerBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  ipsBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  ipsNum: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  ipsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  printBtnText: {
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
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardLeft: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  kodePill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  kode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  warningPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
  },
  matkul: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sks: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradeBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minWidth: 50,
  },
  huruf: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  angka: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyGradeBox: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  emptyGradeText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: radius.sm,
  },
  modalWarningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
  },
  formGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    padding: 10,
    fontSize: 14,
    backgroundColor: colors.surfaceSubtle,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
