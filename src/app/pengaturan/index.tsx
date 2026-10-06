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
import { UBD_COLORS } from '../../constants/theme';

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
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
              <Ionicons name="person" size={28} color="#FFFFFF" />
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
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
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
              <Ionicons name="add" size={16} color="#2563EB" />
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
                        <Ionicons name="radio-button-on" size={20} color="#2563EB" />
                      ) : (
                        <Ionicons name="radio-button-off" size={20} color="#94A3B8" />
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
            <View style={[styles.menuIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Riwayat & Log Audit Sistem</Text>
              <Text style={styles.menuSubtitle}>
                Pantau mutasi nilai, perubahan status mahasiswa, dispensasi KRS, dan aktivitas sistem.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
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
                <Ionicons name="cloud-upload-outline" size={18} color="#2563EB" />
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
                <Text style={styles.versionBadgeText}>v3.1.2 (Enterprise)</Text>
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
          <Text style={[styles.sectionHeading, { color: '#DC2626' }]}>Zona Bahaya (Danger Zone)</Text>
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
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pemulihan Basis Data */}
      <Modal visible={restoreModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalTitle}>Pulihkan Basis Data</Text>
                <Text style={styles.modalSub}>
                  Pilih berkas JSON cadangan atau tempel payload secara langsung
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!restoring) {
                    setRestoreModalVisible(false);
                    setRestoreJsonInput('');
                    setPickedFileName(null);
                  }
                }}
                disabled={restoring}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.restoreWarningBox}>
              <Ionicons name="warning" size={18} color="#B45309" />
              <Text style={styles.restoreWarningText}>
                Pemulihan akan menimpa seluruh basis data secara atomik. Jika terjadi kesalahan saat proses, perubahan akan otomatis dibatalkan (rollback).
              </Text>
            </View>

            <TouchableOpacity
              style={styles.pickFileBtn}
              onPress={handlePickRestoreFile}
              disabled={restoring}
            >
              <Ionicons name="document-text-outline" size={20} color="#2563EB" />
              <Text style={styles.pickFileBtnText}>
                {pickedFileName ? `Berkas: ${pickedFileName}` : 'Pilih Berkas JSON Cadangan'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Atau Tempel Payload JSON:</Text>
            <TextInput
              style={styles.jsonTextArea}
              placeholder='Tempelkan isi JSON cadangan di sini ({"app": "Portal Akademik UBD", ...})'
              placeholderTextColor="#94A3B8"
              value={restoreJsonInput}
              onChangeText={(text) => {
                setRestoreJsonInput(text);
                if (pickedFileName) setPickedFileName(null);
              }}
              multiline
              numberOfLines={6}
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
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: '#DC2626' },
                  (!restoreJsonInput.trim() || restoring) && { opacity: 0.6 },
                ]}
                onPress={handleExecuteRestore}
                disabled={!restoreJsonInput.trim() || restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addSemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addSemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: 12,
    color: '#64748B',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  sessionText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  semList: {
    gap: 8,
  },
  semItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  semItemActive: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
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
    color: '#1E293B',
  },
  semNameActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  appBrandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  appBrandingMotto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoKey: {
    fontSize: 13,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  versionBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  dangerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: '#991B1B',
  },
  dangerDesc: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  dangerBtnOutline: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  dangerBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  dangerBtnSolid: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    marginTop: 4,
  },
  dangerBtnSolidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  backupBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
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
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  restoreWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '500',
  },
  pickFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  pickFileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  jsonTextArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    minHeight: 110,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
