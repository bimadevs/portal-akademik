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
  Modal,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { SemesterService } from '../../services/semester-service';
import { KRSService } from '../../services/krs-service';
import { NilaiService } from '../../services/nilai-service';
import { Mahasiswa, Semester, Nilai, KRS } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

export default function NilaiDetailScreen() {
  const { mahasiswaId } = useLocalSearchParams<{ mahasiswaId: string }>();

  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [krsList, setKrsList] = useState<KRS[]>([]);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [ipsData, setIpsData] = useState<{ totalSks: number; ips: number }>({ totalSks: 0, ips: 0 });
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedKrs, setSelectedKrs] = useState<KRS | null>(null);
  const [tugas, setTugas] = useState('0');
  const [uts, setUts] = useState('0');
  const [uas, setUas] = useState('0');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      if (!mahasiswaId) return;
      const m = await MahasiswaService.getById(mahasiswaId);
      const sem = await SemesterService.getActive();
      setMahasiswa(m);
      setSemester(sem);

      if (sem && m) {
        const krs = await KRSService.getByMahasiswaAndSemester(m.id, sem.id);
        const nilai = await NilaiService.getByMahasiswaAndSemester(m.id, sem.id);
        const ips = await NilaiService.hitungIPS(m.id, sem.id);

        setKrsList(krs);
        setNilaiList(nilai);
        setIpsData(ips);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal memuat data nilai');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
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

          if (ignore) return;
          setKrsList(krs);
          setNilaiList(nilai);
          setIpsData(ips);
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

    fetchData();
    return () => {
      ignore = true;
    };
  }, [mahasiswaId]);

  const openGradeModal = (krs: KRS) => {
    setSelectedKrs(krs);
    const existing = nilaiList.find((n) => n.mata_kuliah_id === krs.mata_kuliah_id);
    if (existing) {
      setTugas(String(existing.tugas));
      setUts(String(existing.uts));
      setUas(String(existing.uas));
    } else {
      setTugas('0');
      setUts('0');
      setUas('0');
    }
    setModalVisible(true);
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

    setSaving(true);
    try {
      await NilaiService.saveNilai({
        mahasiswa_id: mahasiswa.id,
        mata_kuliah_id: selectedKrs.mata_kuliah_id,
        semester_id: semester.id,
        tugas: t,
        uts: m,
        uas: a,
      });

      setModalVisible(false);
      await loadData();
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
        <View style={styles.headerInfo}>
          <Text style={styles.nama}>{mahasiswa?.nama}</Text>
          <Text style={styles.nim}>NIM: {mahasiswa?.nim}</Text>
          <Text style={styles.sem}>{semester?.nama}</Text>
        </View>
        <View style={styles.ipsBadge}>
          <Text style={styles.ipsNum}>{ipsData.ips.toFixed(2)}</Text>
          <Text style={styles.ipsLabel}>IPS ({ipsData.totalSks} SKS)</Text>
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
          const grade = nilaiList.find((n) => n.mata_kuliah_id === item.mata_kuliah_id);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openGradeModal(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.kode}>{item.mata_kuliah_kode}</Text>
                <Text style={styles.matkul}>{item.mata_kuliah_nama}</Text>
                <Text style={styles.sks}>{item.mata_kuliah_sks} SKS</Text>
              </View>

              <View style={styles.cardRight}>
                {grade ? (
                  <View style={styles.gradeBox}>
                    <Text style={styles.huruf}>{grade.huruf}</Text>
                    <Text style={styles.angka}>{grade.akhir} ({(grade.bobot ?? grade.nilaiAngka ?? 0).toFixed(1)})</Text>
                  </View>
                ) : (
                  <View style={styles.emptyGradeBox}>
                    <Text style={styles.emptyGradeText}>Input Nilai</Text>
                  </View>
                )}
                <Ionicons name="create-outline" size={18} color="#64748B" />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Input Nilai Mahasiswa</Text>
            <Text style={styles.modalSub}>{selectedKrs?.mata_kuliah_nama}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nilai Tugas (Bobot 30%)</Text>
              <TextInput
                style={styles.input}
                value={tugas}
                onChangeText={setTugas}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nilai UTS (Bobot 30%)</Text>
              <TextInput
                style={styles.input}
                value={uts}
                onChangeText={setUts}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nilai UAS (Bobot 40%)</Text>
              <TextInput
                style={styles.input}
                value={uas}
                onChangeText={setUas}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveGrade}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Simpan Nilai</Text>
                )}
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerInfo: {
    flex: 1,
  },
  nama: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  nim: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sem: {
    fontSize: 12,
    fontWeight: '600',
    color: UBD_COLORS.ACCENT_DARK,
    marginTop: 2,
  },
  ipsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ipsNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
  },
  ipsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: {
    flex: 1,
  },
  kode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 2,
  },
  matkul: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sks: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradeBox: {
    alignItems: 'flex-end',
  },
  huruf: {
    fontSize: 18,
    fontWeight: '900',
    color: UBD_COLORS.PRIMARY,
  },
  angka: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyGradeBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  emptyGradeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: UBD_COLORS.PRIMARY,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
