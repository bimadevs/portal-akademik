import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
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
import { colors, radius, spacing, shadows } from '@/theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
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
        <Pressable
          style={({ pressed }) => [
            styles.printHeaderBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={handlePrintPDF}
          disabled={printing}
        >
          {printing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="print-outline" size={16} color={colors.primary} />
              <Text style={styles.printHeaderBtnText}>Cetak PDF</Text>
            </>
          )}
        </Pressable>
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
            <Ionicons name="warning" size={18} color={colors.danger} />
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
                trackColor={{ false: colors.borderDefault, true: colors.primaryLight }}
                thumbColor={useDispensasi ? colors.primary : colors.surface}
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
                  placeholderTextColor={colors.textTertiary}
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
            <Pressable
              style={({ pressed }) => [
                styles.courseCard,
                isChecked && styles.courseCardActive,
                pressed && styles.btnPressed,
              ]}
              onPress={() => toggleCourse(item.id)}
            >
              <View style={styles.checkbox}>
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isChecked ? colors.primary : colors.textTertiary}
                />
              </View>
              <View style={styles.courseInfo}>
                <View style={styles.tagRow}>
                  <View style={styles.kodeBadge}>
                    <Text style={styles.kodeTag}>{item.kode}</Text>
                  </View>
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
            </Pressable>
          );
        }}
      />

      {/* Bottom Save Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            isSaveDisabled && styles.saveBtnDisabled,
            pressed && styles.btnPressed,
          ]}
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
        </Pressable>
      </View>
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
  notFound: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  profileBanner: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileTextCol: {
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
  semLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  printHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  quotaCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  quotaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quotaSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quotaBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quotaBadgeDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  quotaBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  quotaBadgeTextDanger: {
    color: colors.danger,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: colors.borderSubtle,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressBarFillSafe: {
    backgroundColor: colors.success,
  },
  progressBarFillDanger: {
    backgroundColor: colors.danger,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.sm,
    padding: 10,
    marginTop: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.danger,
  },
  dispensasiContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
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
    color: colors.textPrimary,
  },
  dispensasiDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dispensasiInputBox: {
    marginTop: spacing.sm,
  },
  dispensasiInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: colors.danger,
  },
  dispensasiInput: {
    height: 38,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
    gap: spacing.sm,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  courseCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSubtle,
  },
  checkbox: {
    marginRight: 10,
  },
  courseInfo: {
    flex: 1,
    gap: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  kodeBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  kodeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  semTag: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  courseDosen: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sksPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sksPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.md,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: colors.textTertiary,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
