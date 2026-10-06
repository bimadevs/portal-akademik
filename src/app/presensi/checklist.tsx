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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KRSService } from '../../services/krs-service';
import { PresensiService } from '../../services/presensi-service';
import { SemesterService } from '../../services/semester-service';
import { StatusPresensi, STATUS_PRESENSI_OPTIONS, Semester } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';

interface MahasiswaPeserta {
  id: number | string;
  nim: string;
  nama: string;
  fakultas: string;
}

export default function PresensiChecklistScreen() {
  const router = useRouter();
  const { mataKuliahId, nama } = useLocalSearchParams<{
    mataKuliahId: string;
    nama: string;
  }>();

  const [semester, setSemester] = useState<Semester | null>(null);
  const [students, setStudents] = useState<MahasiswaPeserta[]>([]);
  const [pertemuanKe, setPertemuanKe] = useState('1');
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, StatusPresensi>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        if (!mataKuliahId) return;
        const sem = await SemesterService.getActive();
        setSemester(sem);

        if (sem) {
          const mhsList = await KRSService.getMahasiswaByMataKuliah(mataKuliahId, sem.id);
          setStudents(mhsList);

          // Inisialisasi default 'HADIR' untuk seluruh mahasiswa
          const initialMap: Record<string, StatusPresensi> = {};
          mhsList.forEach((m) => {
            initialMap[String(m.id)] = 'HADIR';
          });

          // Coba load presensi yang sudah tersimpan untuk tanggal ini
          const existing = await PresensiService.getByPertemuan(mataKuliahId, sem.id, tanggal);
          existing.forEach((p) => {
            initialMap[String(p.mahasiswa_id)] = p.status;
          });

          setAttendance(initialMap);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Gagal memuat peserta kelas');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [mataKuliahId, tanggal]);

  const setStatus = (mahasiswaId: string | number, status: StatusPresensi) => {
    setAttendance((prev) => ({ ...prev, [String(mahasiswaId)]: status }));
  };

  const handleSave = async () => {
    if (!mataKuliahId || !semester) return;
    const pertemuanNum = parseInt(pertemuanKe, 10);
    if (isNaN(pertemuanNum) || pertemuanNum < 1 || pertemuanNum > 16) {
      Alert.alert('Peringatan', 'Pertemuan harus antara 1 sampai 16!');
      return;
    }

    setSaving(true);
    try {
      const records = students.map((s) => ({
        mahasiswa_id: s.id,
        mata_kuliah_id: mataKuliahId,
        semester_id: semester.id,
        tanggal,
        status: attendance[String(s.id)] || 'HADIR',
        pertemuan_ke: pertemuanNum,
      }));

      await PresensiService.savePresensiBatch(records);
      Alert.alert('Sukses', 'Presensi berhasil disimpan!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
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
        <Text style={styles.title}>{nama}</Text>
        <View style={styles.configRow}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Pertemuan Ke</Text>
            <TextInput
              style={styles.configInput}
              value={pertemuanKe}
              onChangeText={setPertemuanKe}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.configItemDate}>
            <Text style={styles.configLabel}>Tanggal (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.configInput}
              value={tanggal}
              onChangeText={setTanggal}
              placeholder="2026-03-30"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>
              Belum ada mahasiswa yang mengambil mata kuliah ini
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const currentStatus = attendance[String(item.id)] || 'HADIR';
          return (
            <View style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentNama}>{item.nama}</Text>
                <Text style={styles.studentNim}>NIM: {item.nim}</Text>
              </View>
              <View style={styles.statusButtons}>
                {STATUS_PRESENSI_OPTIONS.map((st) => {
                  const isActive = currentStatus === st;
                  let bg: string = colors.surfaceSubtle;
                  let textColor: string = colors.textSecondary;
                  let borderColor: string = colors.borderSubtle;

                  if (isActive) {
                    if (st === 'HADIR') {
                      bg = colors.success;
                      textColor = '#FFFFFF';
                      borderColor = colors.success;
                    } else if (st === 'IZIN') {
                      bg = colors.info;
                      textColor = '#FFFFFF';
                      borderColor = colors.info;
                    } else if (st === 'SAKIT') {
                      bg = colors.warning;
                      textColor = '#FFFFFF';
                      borderColor = colors.warning;
                    } else {
                      bg = colors.danger;
                      textColor = '#FFFFFF';
                      borderColor = colors.danger;
                    }
                  }

                  return (
                    <Pressable
                      key={st}
                      style={({ pressed }) => [
                        styles.statusBtn,
                        { backgroundColor: bg, borderColor },
                        pressed && styles.btnPressed,
                      ]}
                      onPress={() => setStatus(item.id, st)}
                    >
                      <Text style={[styles.statusBtnText, { color: textColor }]}>
                        {st[0]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        }}
      />

      {students.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              saving && styles.saveBtnDisabled,
              pressed && styles.btnPressed,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Simpan Presensi</Text>
            )}
          </Pressable>
        </View>
      )}
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
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  configRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  configItem: {
    width: 100,
  },
  configItemDate: {
    flex: 1,
  },
  configLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  configInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
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
  statusButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.md,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
