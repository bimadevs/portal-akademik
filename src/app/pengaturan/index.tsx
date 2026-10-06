import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { SemesterService } from '../../services/semester-service';
import { resetOperationalData, resetDatabase } from '../../services/database';
import { BackupRestoreService } from '../../services/backup-restore-service';
import { Semester } from '../../types/mahasiswa';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export default function PengaturanScreen() {
  const router = useRouter();
  const { userSession, logout } = useAuth();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal tambah semester baru
  const [modalVisible, setModalVisible] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [creating, setCreating] = useState(false);

  // Backup & Restore states
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [restoreJsonInput, setRestoreJsonInput] = useState('');
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadSemesters = async () => {
    try {
      const list = await SemesterService.getAll();
      const active = await SemesterService.getActive();
      setSemesters(list);
      setActiveSemester(active);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal memuat pengaturan semester');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      try {
        const list = await SemesterService.getAll();
        const active = await SemesterService.getActive();
        if (!ignore) {
          setSemesters(list);
          setActiveSemester(active);
        }
      } catch (err: any) {
        if (!ignore) {
          Alert.alert('Error', err.message || 'Gagal memuat pengaturan semester');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSelectSemester = async (sem: Semester) => {
    if (sem.id === activeSemester?.id) return;

    Alert.alert(
      'Ganti Semester Aktif',
      `Aktifkan semester "${sem.nama}" sebagai semester operasional saat ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Aktifkan',
          onPress: async () => {
            try {
              await SemesterService.setActive(sem.id);
              await loadSemesters();
              Alert.alert('Sukses', `Semester aktif berhasil diubah ke "${sem.nama}".`);
            } catch (err: any) {
              Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat mengganti semester');
            }
          },
        },
      ]
    );
  };

  const handleCreateSemester = async () => {
    if (!newSemName.trim()) {
      Alert.alert('Peringatan', 'Nama semester tidak boleh kosong');
      return;
    }

    setCreating(true);
    try {
      await SemesterService.create(newSemName.trim());
      setNewSemName('');
      setModalVisible(false);
      await loadSemesters();
      Alert.alert('Sukses', 'Semester baru berhasil ditambahkan');
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan');
    } finally {
      setCreating(false);
    }
  };

  const handleResetOperational = () => {
    Alert.alert(
      'Konfirmasi Reset Operasional',
      'Tindakan ini akan MENGHAPUS SEMUA data KRS, Jadwal Kuliah, Presensi, dan Nilai. Data master Mahasiswa, Dosen, dan Mata Kuliah tetap tersimpan. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Reset Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOperationalData();
              Alert.alert('Sukses', 'Seluruh data operasional berhasil dibersihkan.');
            } catch (err: any) {
              Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat mereset data');
            }
          },
        },
      ]
    );
  };

  const handleResetTotal = () => {
    Alert.alert(
      'Peringatan Danger Zone: Reset Total',
      'Tindakan ini akan mengembalikan seluruh database ke kondisi instalasi awal (data seed standar UBD). Seluruh data input kustom akan terhapus. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'RESET TOTAL',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              await loadSemesters();
              Alert.alert('Sukses', 'Database telah direset ke data awal pabrik.');
            } catch (err: any) {
              Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat reset database');
            }
          },
        },
      ]
    );
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await BackupRestoreService.generateBackupJson();
      Alert.alert(
        'Cadangan Berhasil Dibuat',
        `Data berhasil dicadangkan (${Object.keys(res.payload.tables).length} tabel, checksum: ${res.payload.checksum}). Berkas telah diekspor.`
      );
    } catch (err: any) {
      Alert.alert('Gagal Mencadangkan', err.message || 'Terjadi kesalahan saat membuat cadangan');
    } finally {
      setBackupLoading(false);
    }
  };

  const handlePickRestoreFile = async () => {
    try {
      const picked = await BackupRestoreService.pickBackupFile();
      if (picked) {
        setRestoreJsonInput(picked.jsonString);
        setPickedFileName(picked.fileName || 'berkas_cadangan.json');
        Alert.alert('Berkas Dipilih', `Berkas ${picked.fileName || 'cadangan'} berhasil dimuat. Silakan periksa atau klik Mulai Pemulihan.`);
      }
    } catch (err: any) {
      Alert.alert('Peringatan', err.message || 'Gagal membaca berkas cadangan.');
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreJsonInput.trim()) {
      Alert.alert('Peringatan', 'Silakan pilih berkas cadangan atau tempelkan JSON cadangan terlebih dahulu.');
      return;
    }

    Alert.alert(
      'Konfirmasi Pemulihan Atomik',
      'PERINGATAN: Tindakan ini akan menimpa seluruh data sistem saat ini dengan data dari cadangan JSON. Seluruh proses bersifat transaksi atomik. Lanjutkan pemulihan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Pulihkan Sekarang',
          style: 'destructive',
          onPress: async () => {
            setRestoring(true);
            try {
              const res = await BackupRestoreService.restoreFromJson(
                restoreJsonInput.trim(),
                userSession?.username || 'admin'
              );
              await loadSemesters();
              setRestoreModalVisible(false);
              setRestoreJsonInput('');
              setPickedFileName(null);
              Alert.alert(
                'Pemulihan Berhasil',
                `Basis data berhasil dipulihkan secara penuh (${res.restoredCount} entitas dipulihkan).`
              );
            } catch (err: any) {
              Alert.alert('Gagal Memulihkan', err.message || 'Terjadi kesalahan saat memulihkan database.');
            } finally {
              setRestoring(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari sesi admin?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Profil Admin */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Profil Administrator</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={26} color={colors.textOnPrimary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userSession?.username || 'Administrator'}</Text>
              <Text style={styles.profileRole}>Admin Akademik • Hak Akses Penuh</Text>
              <View style={styles.sessionBadge}>
                <View style={styles.sessionDot} />
                <Text style={styles.sessionText}>Sesi Aktif</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Semester Aktif */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Semester Akademik</Text>
            <TouchableOpacity
              style={styles.addSemBtn}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={styles.addSemText}>Tambah</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>
              Pilih semester yang dijadikan acuan operasional KRS, Presensi, dan Penilaian:
            </Text>

            <View style={styles.semList}>
              {semesters.map((sem) => {
                const isSelected = sem.id === activeSemester?.id;
                return (
                  <TouchableOpacity
                    key={String(sem.id)}
                    style={[styles.semItem, isSelected && styles.semItemActive]}
                    onPress={() => handleSelectSemester(sem)}
                  >
                    <View style={styles.semRadio}>
                      {isSelected ? (
                        <Ionicons name="radio-button-on" size={20} color={colors.primary} />
                      ) : (
                        <Ionicons name="radio-button-off" size={20} color={colors.textMuted} />
                      )}
                    </View>
                    <View style={styles.semInfo}>
                      <Text style={[styles.semName, isSelected && styles.semNameActive]}>
                        {sem.nama}
                      </Text>
                      {isSelected && (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>AKTIF SAAT INI</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section 3: Audit & Keamanan */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Audit & Keamanan</Text>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/pengaturan/audit-log' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Riwayat & Log Audit Sistem</Text>
              <Text style={styles.menuSubtitle}>
                Pantau mutasi nilai, perubahan status mahasiswa, dispensasi KRS, dan aktivitas sistem.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 4: Cadangan & Pemulihan Basis Data */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Cadangan & Pemulihan Basis Data</Text>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>
              Ekspor seluruh data akademik ke berkas JSON mandiri dengan checksum integritas, atau pulihkan data dari salinan cadangan secara atomik.
            </Text>

            <View style={styles.backupActions}>
              <TouchableOpacity
                style={styles.backupBtn}
                onPress={handleBackup}
                disabled={backupLoading}
                activeOpacity={0.8}
              >
                {backupLoading ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={18} color={colors.textOnPrimary} />
                    <Text style={styles.backupBtnText}>Cadangkan Data (Backup JSON)</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={() => setRestoreModalVisible(true)}
                disabled={backupLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={18} color={colors.accent} />
                <Text style={styles.restoreBtnText}>Pulihkan Data (Restore JSON)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 5: Informasi Aplikasi */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Informasi Aplikasi</Text>
          <View style={styles.card}>
            <View style={styles.appBrandingHeader}>
              <Image
                source={require('@/assets/images/ubd-logo.webp')}
                style={styles.appLogoEmblem}
                resizeMode="contain"
              />
              <View style={styles.appBrandingTextCol}>
                <Text style={styles.appBrandingTitle}>Universitas Buddhi Dharma</Text>
                <Text style={styles.appBrandingMotto}>Kreativitas Membangkitkan Inovasi</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Nama Aplikasi</Text>
              <Text style={styles.infoVal}>Portal Akademik UBD</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Versi Sistem</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>v3.2.0 (Enterprise)</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Database Engine</Text>
              <Text style={styles.infoVal}>expo-sqlite (Local Offline)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Universitas</Text>
              <Text style={styles.infoVal}>Universitas Buddhi Dharma</Text>
            </View>
          </View>
        </View>

        {/* Section 6: Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.danger }]}>Zona Bahaya (Danger Zone)</Text>
          <View style={styles.dangerCard}>
            <View style={styles.dangerItem}>
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerTitle}>Reset Data Operasional</Text>
                <Text style={styles.dangerDesc}>
                  Menghapus semua catatan KRS, Jadwal, Presensi, dan Nilai. Master data Mahasiswa & Dosen tetap aman.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dangerBtnOutline}
                onPress={handleResetOperational}
              >
                <Text style={styles.dangerBtnOutlineText}>Reset Operasional</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.dangerItem}>
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerTitle}>Reset Total Database</Text>
                <Text style={styles.dangerDesc}>
                  Menghapus seluruh isi tabel dan mengembalikan data bawaan pabrik (seed awal).
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dangerBtnSolid}
                onPress={handleResetTotal}
              >
                <Text style={styles.dangerBtnSolidText}>Reset Total</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Tambah Semester Baru */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Semester Baru</Text>
            <Text style={styles.modalSub}>
              Contoh penamaan: &apos;Genap 2025/2026&apos; atau &apos;Pendek 2026&apos;
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nama Semester"
              value={newSemName}
              onChangeText={setNewSemName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={creating}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCreateSemester}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pemulihan Data (Restore JSON) */}
      <Modal visible={restoreModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalTitle}>Pulihkan Basis Data</Text>
                <Text style={styles.modalSub}>
                  Pilih file JSON cadangan dari penyimpanan perangkat atau tempel isi JSON di bawah ini.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setRestoreModalVisible(false);
                  setRestoreJsonInput('');
                  setPickedFileName(null);
                }}
                disabled={restoring}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.restoreWarningBox}>
              <Ionicons name="warning-outline" size={20} color={colors.warning} />
              <Text style={styles.restoreWarningText}>
                Pemulihan akan menimpa seluruh data sistem saat ini dengan isi berkas cadangan.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.pickFileBtn}
              onPress={handlePickRestoreFile}
              disabled={restoring}
            >
              <Ionicons name="document-attach-outline" size={20} color={colors.primary} />
              <Text style={styles.pickFileBtnText}>
                {pickedFileName ? `Berkas: ${pickedFileName}` : 'Pilih Berkas Cadangan (.json)'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Atau Tempel Teks Cadangan JSON:</Text>
            <TextInput
              style={styles.jsonTextArea}
              placeholder='{"app": "portal-akademik", "version": "3.2.0", ...}'
              value={restoreJsonInput}
              onChangeText={setRestoreJsonInput}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!restoring}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setRestoreModalVisible(false);
                  setRestoreJsonInput('');
                  setPickedFileName(null);
                }}
                disabled={restoring}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.accent }]}
                onPress={handleExecuteRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <Text style={styles.modalSaveText}>Mulai Pemulihan</Text>
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
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  addSemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  addSemText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.md,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: shadows.glow,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  sessionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  sessionText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.sm + 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  semList: {
    gap: spacing.sm,
  },
  semItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  semItemActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryLight,
  },
  semRadio: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  semInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  semName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  semNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  appBrandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: 4,
  },
  appLogoEmblem: {
    width: 48,
    height: 48,
  },
  appBrandingTextCol: {
    flex: 1,
    gap: 2,
  },
  appBrandingTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  appBrandingMotto: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoKey: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  versionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  dangerCard: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    gap: 14,
  },
  dangerItem: {
    gap: 8,
  },
  dangerTextContainer: {
    gap: 3,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dangerDark,
  },
  dangerDesc: {
    fontSize: 12,
    color: colors.dangerDark,
    lineHeight: 16,
  },
  dangerBtnOutline: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  dangerBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  dangerBtnSolid: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    marginTop: 4,
  },
  dangerBtnSolidText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    gap: spacing.md,
    boxShadow: shadows.modal,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: 14,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  backupActions: {
    gap: 10,
    marginTop: 4,
  },
  backupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    gap: 8,
  },
  backupBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    gap: 8,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  restoreWarningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  restoreWarningText: {
    flex: 1,
    fontSize: 12,
    color: colors.warningDark,
    lineHeight: 16,
    fontWeight: '500',
  },
  pickFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  pickFileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  jsonTextArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
    minHeight: 110,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
