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
      <UBDHeader subtitle="Registrasi Data Mahasiswa" variant="elevated" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Introduction */}
          <View style={styles.introHeader}>
            <Text style={styles.introTitle}>Formulir Registrasi Mahasiswa</Text>
            <Text style={styles.introSubtitle}>
              Lengkapi data identitas dan penempatan fakultas mahasiswa baru
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Profil & Foto */}
            <View style={styles.photoSection}>
              <PhotoAvatar
                uri={fotoUrl}
                size={80}
                name={nama}
                editable
                onPress={handlePickPhoto}
              />
              <View style={styles.photoInfoCol}>
                <Text style={styles.photoTitle}>Pasfoto Mahasiswa</Text>
                <Text style={styles.photoSubtitle}>
                  {fotoUrl ? 'Foto profil terunggah' : 'Format pasfoto resmi (Opsional)'}
                </Text>
                <Pressable
                  onPress={handlePickPhoto}
                  style={styles.photoBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Unggah atau ganti foto mahasiswa"
                >
                  <Ionicons name="camera-outline" size={14} color={colors.primary} />
                  <Text style={styles.photoBtnText}>
                    {fotoUrl ? 'Ganti Foto' : 'Pilih Foto'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Field 1: NIM / Kode Mahasiswa */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Kode Mahasiswa (NIM)</Text>
                <Text style={styles.requiredPill}>Wajib</Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'nim' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="id-card-outline"
                  size={18}
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
                  <Pressable onPress={() => setNim('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
              <Text style={styles.helperText}>Nomor unik identitas mahasiswa di basis data</Text>
            </View>

            {/* Field 2: Nama Mahasiswa */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Nama Lengkap Mahasiswa</Text>
                <Text style={styles.requiredPill}>Wajib</Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'nama' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedInput === 'nama' ? colors.primary : colors.textSecondary}
                  style={styles.leadingIcon}
                />
                <TextInput
                  value={nama}
                  onChangeText={setNama}
                  onFocus={() => setFocusedInput('nama')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Masukkan nama lengkap sesuai ijazah"
                  placeholderTextColor={colors.textMuted}
                  style={styles.textInput}
                  accessibilityLabel="Input Nama Mahasiswa"
                />
                {nama.length > 0 && (
                  <Pressable onPress={() => setNama('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
              <Text style={styles.helperText}>Sesuai identitas resmi KTP / Ijazah</Text>
            </View>

            {/* Field 3: Jenis Kelamin */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Jenis Kelamin</Text>
              <View style={styles.genderRow}>
                {/* Opsi PRIA */}
                <Pressable
                  onPress={() => setJenisKelamin('PRIA')}
                  style={({ pressed }) => [
                    styles.genderOption,
                    jenisKelamin === 'PRIA' && styles.genderOptionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: jenisKelamin === 'PRIA' }}
                  accessibilityLabel="Pilih Jenis Kelamin PRIA"
                >
                  <RadioButton
                    selected={jenisKelamin === 'PRIA'}
                    onPress={() => setJenisKelamin('PRIA')}
                    size={17}
                  />
                  <Ionicons
                    name="male"
                    size={17}
                    color={jenisKelamin === 'PRIA' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderLabel,
                      jenisKelamin === 'PRIA' && styles.genderLabelSelected,
                    ]}
                  >
                    PRIA
                  </Text>
                </Pressable>

                {/* Opsi WANITA */}
                <Pressable
                  onPress={() => setJenisKelamin('WANITA')}
                  style={({ pressed }) => [
                    styles.genderOption,
                    jenisKelamin === 'WANITA' && styles.genderOptionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: jenisKelamin === 'WANITA' }}
                  accessibilityLabel="Pilih Jenis Kelamin WANITA"
                >
                  <RadioButton
                    selected={jenisKelamin === 'WANITA'}
                    onPress={() => setJenisKelamin('WANITA')}
                    size={17}
                  />
                  <Ionicons
                    name="female"
                    size={17}
                    color={jenisKelamin === 'WANITA' ? '#DB2777' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderLabel,
                      jenisKelamin === 'WANITA' && styles.genderLabelSelected,
                    ]}
                  >
                    WANITA
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Field 4: Fakultas Picker */}
            <View style={styles.inputGroup}>
              <FacultyPicker value={fakultas} onChange={setFakultas} />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  isSaving && styles.saveButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Simpan Data Mahasiswa"
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <View style={styles.buttonInner}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>SIMPAN DATA MAHASISWA</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleReset}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.resetButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Bersihkan Form Input"
              >
                <Text style={styles.resetButtonText}>Bersihkan Formulir</Text>
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
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 24,
    gap: spacing.lg,
  },
  introHeader: {
    gap: 3,
    paddingHorizontal: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  introSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.lg,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoInfoCol: {
    flex: 1,
    gap: 3,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  photoSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSubtle,
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
  requiredPill: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
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
  helperText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  genderLabelSelected: {
    color: colors.primary,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.card,
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryHover,
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textOnPrimary,
    letterSpacing: 0.8,
  },
  resetButton: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetButtonPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
