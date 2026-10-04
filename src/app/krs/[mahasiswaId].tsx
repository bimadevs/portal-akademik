import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { SemesterService } from '../../services/semester-service';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { KRSService } from '../../services/krs-service';
import { AcademicRulesService } from '../../services/academic-rules-service';
import { PDFService } from '../../services/pdf-service';
import { Mahasiswa, Semester, MataKuliah, SksQuotaInfo, KRS } from '../../types/mahasiswa';
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
  const [printing, setPrinting] = useState(false);

  // V3 SKS Capping & Dekanat Dispensation State
  const [sksQuota, setSksQuota] = useState<SksQuotaInfo>({
    ipsLalu: null,
    kuotaMaksimal: 20,
    sksTerpilih: 0,
    isOverLimit: false,
  });
  const [useDispensasi, setUseDispensasi] = useState(false);
  const [nomorDispensasi, setNomorDispensasi] = useState('');

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
          const enrolledIds = enrolled
            .map((k) => k.mata_kuliah_id ?? k.mataKuliahId)
            .filter((id): id is string | number => id !== undefined);

          setSelectedCourseIds(enrolledIds);

          const initialSks = allCourses
            .filter((c) => enrolledIds.includes(c.id))
            .reduce((acc, c) => acc + Number(c.sks || 0), 0);

          const quotaInfo = await AcademicRulesService.getSksQuotaInfo(m.id, sem.id, initialSks);
          setSksQuota(quotaInfo);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Gagal memuat form KRS');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [mahasiswaId]);

  const totalSks = useMemo(() => {
    return selectedCourseIds.reduce<number>((acc, id) => {
      const c = courses.find((x) => x.id === id);
      return acc + Number(c?.sks || 0);
    }, 0);
  }, [selectedCourseIds, courses]);

  // Derived state: calculate over limit directly from current totalSks and quota
  const isOverLimit = totalSks > (sksQuota.kuotaMaksimal || 20);

  const toggleCourse = (courseId: string | number) => {
    const isSelected = selectedCourseIds.includes(courseId);
    if (isSelected) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      const courseToAdd = courses.find((c) => c.id === courseId);
      const newTotal = totalSks + Number(courseToAdd?.sks || 0);

      if (newTotal > 24) {
        Alert.alert(
          'Batas Absolut Terlampaui',
          'Sistem universitas tidak memperkenankan pengambilan lebih dari 24 SKS dalam satu semester.'
        );
        return;
      }

      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const isSaveDisabled = useMemo(() => {
    if (saving) return true;
    if (totalSks === 0) return false; // Allowed to clear KRS
    if (isOverLimit) {
      // Must use valid dekanat dispensation
      return !useDispensasi || !nomorDispensasi.trim();
    }
    return false;
  }, [saving, totalSks, isOverLimit, useDispensasi, nomorDispensasi]);

  const handleSave = async () => {
    if (!mahasiswa || !semester) return;

    if (isOverLimit && (!useDispensasi || !nomorDispensasi.trim())) {
      Alert.alert(
        'Beban SKS Melebihi Kuota',
        `Total SKS (${totalSks}) melebihi kuota maksimal (${sksQuota.kuotaMaksimal} SKS). Harap aktifkan dispensasi dekanat dan sertakan nomor surat izin resmi.`
      );
      return;
    }

    setSaving(true);
    try {
      const dispensasiPayload = useDispensasi && nomorDispensasi.trim()
        ? {
            nomorSurat: nomorDispensasi.trim(),
            totalSks,
            kuotaNormal: sksQuota.kuotaMaksimal,
            actor: 'admin',
          }
        : undefined;

      await KRSService.saveKRS(mahasiswa.id, semester.id, selectedCourseIds, dispensasiPayload);

      Alert.alert('Sukses', 'Kartu Rencana Studi (KRS) berhasil disimpan!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menyimpan KRS');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!mahasiswa || !semester) return;

    const enrolledList: KRS[] = courses
      .filter((c) => selectedCourseIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        mahasiswa_id: mahasiswa.id,
        semester_id: semester.id,
        mata_kuliah_id: c.id,
        kode: c.kode,
        nama: c.nama,
        sks: c.sks,
        dosenNama: c.dosenNama || (c as any).dosen_nama || 'Belum Ditentukan',
      }));

    if (enrolledList.length === 0) {
      Alert.alert('Perhatian', 'Mahasiswa belum memilih mata kuliah untuk dicetak.');
      return;
    }

    setPrinting(true);
    try {
      await PDFService.generateKRSPdf({
        mahasiswa,
        krsItems: enrolledList,
        semester,
        totalSks,
      });
    } catch (err: any) {
      Alert.alert('Gagal Cetak', err.message || 'Terjadi kesalahan saat mencetak berkas PDF.');
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

  if (!mahasiswa) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Mahasiswa tidak ditemukan</Text>
      </View>
    );
  }

  const quotaRatio = Math.min(totalSks / (sksQuota.kuotaMaksimal || 20), 1);
  const isDanger = isOverLimit;

  return (
    <View style={styles.container}>
      {/* Top Banner: Info Mahasiswa */}
      <View style={styles.profileBanner}>
        <View style={styles.profileTextCol}>
          <Text style={styles.nama}>{mahasiswa.nama}</Text>
          <Text style={styles.nim}>NIM: {mahasiswa.nim} • {mahasiswa.fakultas}</Text>
          <Text style={styles.semLabel}>Semester: {semester?.nama}</Text>
        </View>
        <TouchableOpacity
          style={styles.printHeaderBtn}
          onPress={handlePrintPDF}
          disabled={printing}
          activeOpacity={0.7}
        >
          {printing ? (
            <ActivityIndicator size="small" color={UBD_COLORS.PRIMARY} />
          ) : (
            <>
              <Ionicons name="print-outline" size={18} color={UBD_COLORS.PRIMARY} />
              <Text style={styles.printHeaderBtnText}>Cetak PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* V3 Academic Rules: Quota Card */}
      <View style={styles.quotaCard}>
        <View style={styles.quotaHeaderRow}>
          <View>
            <Text style={styles.quotaTitle}>Aturan Kuota SKS (Regulasi Dikti)</Text>
            <Text style={styles.quotaSubtitle}>
              IPS Lalu: {sksQuota.ipsLalu !== null ? sksQuota.ipsLalu.toFixed(2) : 'Mahasiswa Baru (20 SKS)'}
            </Text>
          </View>
          <View style={[styles.quotaBadge, isDanger && styles.quotaBadgeDanger]}>
            <Text style={[styles.quotaBadgeText, isDanger && styles.quotaBadgeTextDanger]}>
              {totalSks} / {sksQuota.kuotaMaksimal} SKS
            </Text>
          </View>
        </View>

        {/* Visual Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${quotaRatio * 100}%` },
              isDanger ? styles.progressBarFillDanger : styles.progressBarFillSafe,
            ]}
          />
        </View>

        {/* Warning Banner if Over Quota */}
        {isDanger && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={18} color="#DC2626" />
            <Text style={styles.warningText}>
              Beban SKS ({totalSks}) melebihi kuota maksimal ({sksQuota.kuotaMaksimal} SKS)!
            </Text>
          </View>
        )}

        {/* Dekanat Dispensation Section */}
        {isDanger && (
          <View style={styles.dispensasiContainer}>
            <View style={styles.dispensasiToggleRow}>
              <View style={styles.dispensasiLabelCol}>
                <Text style={styles.dispensasiTitle}>Dispensasi SKS Dekanat</Text>
                <Text style={styles.dispensasiDesc}>
                  Izinkan pengambilan SKS melampaui kuota resmi dekanat
                </Text>
              </View>
              <Switch
                value={useDispensasi}
                onValueChange={setUseDispensasi}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={useDispensasi ? UBD_COLORS.PRIMARY : '#F1F5F9'}
              />
            </View>

            {useDispensasi && (
              <View style={styles.dispensasiInputBox}>
                <Text style={styles.dispensasiInputLabel}>
                  Nomor Surat / Alasan Dispensasi <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={styles.dispensasiInput}
                  placeholder="Contoh: SK-DEKAN-082/UBD/2026"
                  value={nomorDispensasi}
                  onChangeText={setNomorDispensasi}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Courses FlatList */}
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
                  <Text style={styles.semTag}>Semester {item.semester || 1}</Text>
                </View>
                <Text style={styles.courseName}>{item.nama}</Text>
                <Text style={styles.courseDosen}>
                  Dosen: {item.dosenNama || (item as any).dosen_nama || 'Belum Ditentukan'}
                </Text>
              </View>
              <View style={styles.sksPill}>
                <Text style={styles.sksPillText}>{item.sks} SKS</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Bottom Save Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaveDisabled && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>
              {sksQuota.isOverLimit && !useDispensasi
                ? 'Beban SKS Melebihi Kuota'
                : 'Simpan Kartu Rencana Studi'}
            </Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  profileBanner: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileTextCol: {
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
  semLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: UBD_COLORS.ACCENT_DARK,
    marginTop: 3,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  printHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: UBD_COLORS.PRIMARY,
  },
  quotaCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  quotaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  quotaSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quotaBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quotaBadgeDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  quotaBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: UBD_COLORS.PRIMARY,
  },
  quotaBadgeTextDanger: {
    color: '#DC2626',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarFillSafe: {
    backgroundColor: '#10B981',
  },
  progressBarFillDanger: {
    backgroundColor: '#EF4444',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
  },
  dispensasiContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dispensasiToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dispensasiLabelCol: {
    flex: 1,
    paddingRight: 10,
  },
  dispensasiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  dispensasiDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  dispensasiInputBox: {
    marginTop: 10,
  },
  dispensasiInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: '#DC2626',
  },
  dispensasiInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 14,
    paddingBottom: 90,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
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
    marginBottom: 4,
  },
  kodeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: UBD_COLORS.PRIMARY,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  semTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseDosen: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sksPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  sksPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: UBD_COLORS.PRIMARY,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: UBD_COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
