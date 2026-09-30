import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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
import { UBD_COLORS } from '../../constants/theme';

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{nama}</Text>
        <View style={styles.configRow}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Pertemuan Ke-</Text>
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
            <Ionicons name="people-outline" size={48} color="#94A3B8" />
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
                  let bg = '#F1F5F9';
                  let textColor = '#64748B';

                  if (isActive) {
                    if (st === 'HADIR') {
                      bg = '#16A34A';
                      textColor = '#FFFFFF';
                    } else if (st === 'IZIN') {
                      bg = '#0284C7';
                      textColor = '#FFFFFF';
                    } else if (st === 'SAKIT') {
                      bg = '#E5A823';
                      textColor = '#FFFFFF';
                    } else {
                      bg = '#DC2626';
                      textColor = '#FFFFFF';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.statusBtn, { backgroundColor: bg }]}
                      onPress={() => setStatus(item.id, st)}
                    >
                      <Text style={[styles.statusBtnText, { color: textColor }]}>
                        {st[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
      />

      {students.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Simpan Presensi</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  configRow: {
    flexDirection: 'row',
    gap: 12,
  },
  configItem: {
    width: 90,
  },
  configItemDate: {
    flex: 1,
  },
  configLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  configInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentInfo: {
    flex: 1,
  },
  studentNama: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentNim: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: UBD_COLORS.PRIMARY,
    borderRadius: 10,
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
    marginTop: 8,
    textAlign: 'center',
  },
});
