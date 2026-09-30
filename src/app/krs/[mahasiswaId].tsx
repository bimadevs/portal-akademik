import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { SemesterService } from '../../services/semester-service';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { KRSService } from '../../services/krs-service';
import { Mahasiswa, Semester, MataKuliah } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

export default function KRSEnrollScreen() {
  const router = useRouter();
  const { mahasiswaId } = useLocalSearchParams<{ mahasiswaId: string }>();

  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [courses, setCourses] = useState<MataKuliah[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        if (!mahasiswaId) return;
        const m = await MahasiswaService.getById(mahasiswaId);
        const sem = await SemesterService.getActive();
        const allCourses = await MataKuliahService.getAll();

        setMahasiswa(m);
        setSemester(sem);
        setCourses(allCourses);

        if (sem && m) {
          const enrolled = await KRSService.getByMahasiswaAndSemester(m.id, sem.id);
          setSelectedCourseIds(
            enrolled
              .map((k) => k.mata_kuliah_id ?? k.mataKuliahId)
              .filter((id): id is string | number => id !== undefined)
          );
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Gagal memuat form KRS');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [mahasiswaId]);

  const toggleCourse = (courseId: string | number) => {
    const isSelected = selectedCourseIds.includes(courseId);
    if (isSelected) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      const courseToAdd = courses.find((c) => c.id === courseId);
      const currentSks = selectedCourseIds.reduce<number>((acc, id) => {
        const c = courses.find((x) => x.id === id);
        return acc + Number(c?.sks || 0);
      }, 0);

      const newTotal = currentSks + Number(courseToAdd?.sks || 0);
      if (newTotal > 24) {
        Alert.alert('Batas SKS Terlampaui', 'Maksimal pengambilan mata kuliah adalah 24 SKS.');
        return;
      }

      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const totalSks = selectedCourseIds.reduce<number>((acc, id) => {
    const c = courses.find((x) => x.id === id);
    return acc + Number(c?.sks || 0);
  }, 0);

  const handleSave = async () => {
    if (!mahasiswa || !semester) return;

    setSaving(true);
    try {
      await KRSService.saveKRS(mahasiswa.id, semester.id, selectedCourseIds);
      Alert.alert('Sukses', 'KRS berhasil disimpan!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menyimpan KRS');
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

  if (!mahasiswa) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Mahasiswa tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileBanner}>
        <View>
          <Text style={styles.nama}>{mahasiswa.nama}</Text>
          <Text style={styles.nim}>NIM: {mahasiswa.nim} • {mahasiswa.fakultas}</Text>
          <Text style={styles.semLabel}>Semester: {semester?.nama}</Text>
        </View>
        <View style={styles.sksTotalBadge}>
          <Text style={styles.sksTotalText}>{totalSks} / 24</Text>
          <Text style={styles.sksTotalSub}>SKS Dipilih</Text>
        </View>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isChecked = selectedCourseIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.courseCard, isChecked && styles.courseCardActive]}
              onPress={() => toggleCourse(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isChecked ? UBD_COLORS.PRIMARY : '#94A3B8'}
                />
              </View>
              <View style={styles.courseInfo}>
                <View style={styles.tagRow}>
                  <Text style={styles.kodeTag}>{item.kode}</Text>
                  <Text style={styles.semTag}>Semester {item.semester}</Text>
                </View>
                <Text style={styles.courseName}>{item.nama}</Text>
                <Text style={styles.courseDosen}>
                  Dosen: {item.dosen_nama || 'Belum Ditentukan'}
                </Text>
              </View>
              <View style={styles.sksPill}>
                <Text style={styles.sksPillText}>{item.sks} SKS</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Simpan Kartu Rencana Studi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileBanner: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  semLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: UBD_COLORS.ACCENT_DARK,
    marginTop: 4,
  },
  sksTotalBadge: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sksTotalText: {
    fontSize: 16,
    fontWeight: '800',
    color: UBD_COLORS.PRIMARY,
  },
  sksTotalSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courseCardActive: {
    borderColor: UBD_COLORS.PRIMARY,
    backgroundColor: '#F0F9FF',
  },
  checkbox: {
    marginRight: 10,
  },
  courseInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  kodeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  semTag: {
    fontSize: 11,
    color: '#64748B',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseDosen: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sksPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sksPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
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
  notFound: {
    color: '#64748B',
    fontSize: 16,
  },
});
