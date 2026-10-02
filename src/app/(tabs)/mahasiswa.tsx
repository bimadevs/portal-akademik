import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FacultyPicker } from '@/components/faculty-picker';
import { RadioButton } from '@/components/radio-button';
import { UBDHeader } from '@/components/ubd-header';
import { PhotoAvatar } from '@/components/photo-avatar';
import { PhotoService } from '@/services/photo-service';
import { StorageService } from '@/services/storage';
import { Fakultas, Gender } from '@/types/mahasiswa';
import { colors, radius, shadows, spacing } from '@/theme';

export default function InputMahasiswaScreen() {
  const router = useRouter();

  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('PRIA');
  const [fakultas, setFakultas] = useState<Fakultas>('Sains dan Teknologi');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'nim' | 'nama' | null>(null);

  const handlePickPhoto = () => {
    PhotoService.showPhotoOptions({
      title: 'Foto Profil Mahasiswa',
      hasExistingPhoto: Boolean(fotoUrl),
      onPhotoSelected: (uri) => setFotoUrl(uri),
      onPhotoRemoved: () => setFotoUrl(null),
    });
  };

  const handleSave = async () => {
    const cleanNim = nim.trim();
    const cleanNama = nama.trim();

    // Validasi kelengkapan data
    if (!cleanNim || !cleanNama) {
      Alert.alert('Peringatan', 'Harap lengkapi semua data mahasiswa!');
      return;
    }

    setIsSaving(true);
    try {
      const result = await StorageService.saveMahasiswa({
        nim: cleanNim,
        nama: cleanNama,
        jenisKelamin,
        fakultas,
        fotoUrl: fotoUrl || undefined,
      });

      if (!result.success) {
        Alert.alert('Validasi Gagal', result.error ?? 'Gagal menyimpan data.');
        return;
      }

      // Reset form setelah berhasil simpan
      setNim('');
      setNama('');
      setJenisKelamin('PRIA');
      setFakultas('Sains dan Teknologi');
      setFotoUrl(null);

      // Auto-redirect ke tab Report sesuai alur FR-10
      router.push('/(tabs)/report');
    } catch {
      Alert.alert('Error', 'Terjadi kesalahan sistem saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setNim('');
    setNama('');
    setJenisKelamin('PRIA');
    setFakultas('Sains dan Teknologi');
    setFotoUrl(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Resmi UBD */}
      <UBDHeader subtitle="Modul Input Data Mahasiswa" variant="elevated" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner Form */}
          <LinearGradient
            colors={['#0F172A', '#1E3A8A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formHeroCard}
          >
            <View style={styles.heroRow}>
              <View style={styles.heroTextCol}>
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeText}>REGISTRASI MAHASISWA</Text>
                </View>
                <Text style={styles.heroTitle}>Input Data Mahasiswa</Text>
                <Text style={styles.heroSubtitle}>
                  Tambahkan entri data mahasiswa baru ke basis data universitas
                </Text>
              </View>

              <View style={styles.heroIconBox}>
                <Ionicons name="person-add" size={26} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>

          {/* Form Fields Card Container */}
          <View style={styles.formCard}>
            {/* Foto Mahasiswa */}
            <View style={styles.photoUploadRow}>
              <PhotoAvatar
                uri={fotoUrl}
                size={84}
                name={nama}
                editable
                onPress={handlePickPhoto}
              />
              <View style={styles.photoUploadInfo}>
                <Text style={styles.photoUploadTitle}>Foto Mahasiswa</Text>
                <Text style={styles.photoUploadSubtitle}>
                  {fotoUrl ? 'Foto telah dipilih' : 'Tambahkan foto dari kamera atau galeri'}
                </Text>
                <Pressable
                  onPress={handlePickPhoto}
                  style={styles.photoUploadButton}
                  accessibilityRole="button"
                  accessibilityLabel="Pilih Foto Mahasiswa"
                >
                  <Ionicons name="camera-outline" size={15} color={colors.primary} />
                  <Text style={styles.photoUploadButtonText}>
                    {fotoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Field 1: Kode Mahasiswa / NIM */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Kode Mahasiswa (NIM)</Text>
                <Text style={styles.requiredTag}>*Wajib</Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'nim' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="id-card-outline"
                  size={20}
                  color={focusedInput === 'nim' ? colors.primary : colors.textSecondary}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={nim}
                  onChangeText={setNim}
                  onFocus={() => setFocusedInput('nim')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Contoh: 2021010012"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="numeric"
                  style={styles.textInput}
                  accessibilityLabel="Input Kode Mahasiswa / NIM"
                />
                {nim.length > 0 && (
                  <Pressable onPress={() => setNim('')} hitSlop={6}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
              <Text style={styles.helperText}>Nomor Induk Mahasiswa resmi yang unik</Text>
            </View>

            {/* Field 2: Nama Mahasiswa */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Nama Mahasiswa</Text>
                <Text style={styles.requiredTag}>*Wajib</Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'nama' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={focusedInput === 'nama' ? colors.primary : colors.textSecondary}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={nama}
                  onChangeText={setNama}
                  onFocus={() => setFocusedInput('nama')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Masukkan nama lengkap mahasiswa"
                  placeholderTextColor={colors.textMuted}
                  style={styles.textInput}
                  accessibilityLabel="Input Nama Mahasiswa"
                />
                {nama.length > 0 && (
                  <Pressable onPress={() => setNama('')} hitSlop={6}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
              <Text style={styles.helperText}>Sesuai identitas resmi KTP / Ijazah</Text>
            </View>

            {/* Field 3: Jenis Kelamin (Modern Segmented Interactive Cards) */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Jenis Kelamin</Text>
              <View style={styles.genderGrid}>
                {/* Opsi PRIA */}
                <Pressable
                  onPress={() => setJenisKelamin('PRIA')}
                  style={({ pressed }) => [
                    styles.genderCard,
                    jenisKelamin === 'PRIA' && styles.genderCardPriaSelected,
                    pressed && styles.cardPressed,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: jenisKelamin === 'PRIA' }}
                  accessibilityLabel="Pilih Jenis Kelamin PRIA"
                >
                  <RadioButton
                    selected={jenisKelamin === 'PRIA'}
                    onPress={() => setJenisKelamin('PRIA')}
                    size={18}
                  />
                  <Ionicons
                    name="male"
                    size={18}
                    color={jenisKelamin === 'PRIA' ? '#2563EB' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderLabel,
                      jenisKelamin === 'PRIA' && styles.genderLabelPriaSelected,
                    ]}
                    numberOfLines={1}
                  >
                    PRIA
                  </Text>
                </Pressable>

                {/* Opsi WANITA */}
                <Pressable
                  onPress={() => setJenisKelamin('WANITA')}
                  style={({ pressed }) => [
                    styles.genderCard,
                    jenisKelamin === 'WANITA' && styles.genderCardWanitaSelected,
                    pressed && styles.cardPressed,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: jenisKelamin === 'WANITA' }}
                  accessibilityLabel="Pilih Jenis Kelamin WANITA"
                >
                  <RadioButton
                    selected={jenisKelamin === 'WANITA'}
                    onPress={() => setJenisKelamin('WANITA')}
                    size={18}
                  />
                  <Ionicons
                    name="female"
                    size={18}
                    color={jenisKelamin === 'WANITA' ? '#DB2777' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderLabel,
                      jenisKelamin === 'WANITA' && styles.genderLabelWanitaSelected,
                    ]}
                    numberOfLines={1}
                  >
                    WANITA
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Field 4: Dropdown Fakultas */}
            <View style={styles.inputGroup}>
              <FacultyPicker value={fakultas} onChange={setFakultas} />
            </View>

            {/* Actions: SAVE Button & Reset */}
            <View style={styles.actionBlock}>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButtonWrapper,
                  pressed && styles.saveButtonPressed,
                  isSaving && styles.saveButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Tombol Simpan Data Mahasiswa"
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator color={colors.textOnPrimary} />
                  ) : (
                    <View style={styles.buttonInner}>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>SAVE / SIMPAN DATA</Text>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={handleReset}
                disabled={isSaving}
                style={styles.resetButton}
                accessibilityRole="button"
                accessibilityLabel="Reset Formulir"
              >
                <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.resetButtonText}>Reset Form</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 20,
    gap: spacing.lg,
  },
  formHeroCard: {
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    boxShadow: shadows.cardElevated,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroTextCol: {
    flex: 1,
    gap: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E0F2FE',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    boxShadow: shadows.card,
    gap: spacing.lg,
  },
  photoUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoUploadInfo: {
    flex: 1,
    gap: 4,
  },
  photoUploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  photoUploadSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  photoUploadButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  requiredTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  helperText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    boxShadow: shadows.subtle,
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  genderGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    gap: 8,
  },
  genderCardPriaSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    boxShadow: shadows.subtle,
  },
  genderCardWanitaSelected: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
    boxShadow: shadows.subtle,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  genderLabelPriaSelected: {
    fontWeight: '800',
    color: '#1D4ED8',
  },
  genderLabelWanitaSelected: {
    fontWeight: '800',
    color: '#BE185D',
  },
  actionBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  saveButtonWrapper: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: shadows.glow,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

