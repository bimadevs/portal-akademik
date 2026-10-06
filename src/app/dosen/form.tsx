import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DosenService } from '../../services/dosen-service';
import { FAKULTAS_OPTIONS, Fakultas } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';
import { PhotoAvatar } from '@/components/photo-avatar';
import { PhotoService } from '@/services/photo-service';

export default function DosenFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [nidn, setNidn] = useState('');
  const [nama, setNama] = useState('');
  const [gelar, setGelar] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [fakultas, setFakultas] = useState<Fakultas>(FAKULTAS_OPTIONS[0]);
  const [prodi, setProdi] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      DosenService.getById(id)
        .then((dosen) => {
          if (dosen) {
            setNidn(dosen.nidn);
            setNama(dosen.nama);
            setGelar(dosen.gelar || '');
            setEmail(dosen.email || '');
            setNoHp(dosen.no_hp || '');
            setFakultas(dosen.fakultas);
            setProdi(dosen.prodi || '');
            setFotoUrl(dosen.fotoUrl || (dosen as any).foto_url || null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePickPhoto = () => {
    PhotoService.showPhotoOptions({
      title: 'Foto Profil Dosen',
      hasExistingPhoto: Boolean(fotoUrl),
      onPhotoSelected: (uri) => setFotoUrl(uri),
      onPhotoRemoved: () => setFotoUrl(null),
    });
  };

  const handleSubmit = async () => {
    if (!nidn.trim() || !nama.trim() || !prodi.trim()) {
      Alert.alert('Peringatan', 'NIDN, Nama Lengkap, dan Prodi wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await DosenService.update(id, {
          nidn: nidn.trim(),
          nama: nama.trim(),
          gelar: gelar.trim(),
          email: email.trim(),
          no_hp: noHp.trim(),
          fakultas,
          prodi: prodi.trim(),
          fotoUrl: fotoUrl,
        });
        Alert.alert('Sukses', 'Data dosen berhasil diperbarui!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await DosenService.create({
          nidn: nidn.trim(),
          nama: nama.trim(),
          gelar: gelar.trim(),
          email: email.trim(),
          no_hp: noHp.trim(),
          fakultas,
          prodi: prodi.trim(),
          fotoUrl: fotoUrl || undefined,
        });
        Alert.alert('Sukses', 'Dosen baru berhasil ditambahkan!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Upload Foto Dosen */}
      <View style={styles.photoSection}>
        <PhotoAvatar
          uri={fotoUrl}
          size={96}
          name={nama}
          editable
          onPress={handlePickPhoto}
        />
        <Pressable
          onPress={handlePickPhoto}
          style={({ pressed }) => [
            styles.changePhotoBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.changePhotoText}>
            {fotoUrl ? 'Ganti Foto Dosen' : 'Upload Foto Dosen'}
          </Text>
        </Pressable>
        <Text style={styles.photoHint}>Ketuk avatar untuk mengambil dari kamera atau galeri</Text>
      </View>

      <Text style={styles.label}>NIDN *</Text>
      <TextInput
        style={styles.input}
        value={nidn}
        onChangeText={setNidn}
        placeholder="Contoh: 0412038501"
        placeholderTextColor={colors.textTertiary}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Nama Lengkap *</Text>
      <TextInput
        style={styles.input}
        value={nama}
        onChangeText={setNama}
        placeholder="Contoh: Dr. Budi Santoso"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Gelar Akademik</Text>
      <TextInput
        style={styles.input}
        value={gelar}
        onChangeText={setGelar}
        placeholder="Contoh: M.Kom., Ph.D."
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Fakultas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipGroup}>
          {FAKULTAS_OPTIONS.map((f) => (
            <Pressable
              key={f}
              style={({ pressed }) => [
                styles.chip,
                fakultas === f && styles.chipActive,
                pressed && styles.btnPressed,
              ]}
              onPress={() => setFakultas(f)}
            >
              <Text style={[styles.chipText, fakultas === f && styles.chipTextActive]}>
                {f.replace('Fakultas ', '')}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.label}>Program Studi *</Text>
      <TextInput
        style={styles.input}
        value={prodi}
        onChangeText={setProdi}
        placeholder="Contoh: Teknik Informatika"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Contoh: dosen@ubd.ac.id"
        placeholderTextColor={colors.textTertiary}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>No. Handphone / WhatsApp</Text>
      <TextInput
        style={styles.input}
        value={noHp}
        onChangeText={setNoHp}
        placeholder="Contoh: 08123456789"
        placeholderTextColor={colors.textTertiary}
        keyboardType="phone-pad"
      />

      <Pressable
        style={({ pressed }) => [
          styles.submitBtn,
          saving && styles.submitBtnDisabled,
          pressed && styles.btnPressed,
        ]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>{isEdit ? 'Perbarui Data Dosen' : 'Simpan Dosen Baru'}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipScroll: {
    marginBottom: 4,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
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
  photoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 8,
    ...shadows.sm,
  },
  changePhotoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 4,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  photoHint: {
    fontSize: 11,
    color: colors.textTertiary,
  },
});
