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
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { DosenService } from '../../services/dosen-service';
import { Dosen } from '../../types/mahasiswa';
import { colors, radius, spacing } from '@/theme';

export default function MataKuliahFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [sks, setSks] = useState('3');
  const [semester, setSemester] = useState('1');
  const [dosenId, setDosenId] = useState<string | number | null>(null);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    DosenService.getAll().then(setDosenList);

    if (id) {
      MataKuliahService.getById(id)
        .then((mk) => {
          if (mk) {
            setKode(mk.kode);
            setNama(mk.nama);
            setSks(String(mk.sks));
            setSemester(String(mk.semester));
            setDosenId(mk.dosen_id ?? mk.dosenId ?? null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!kode.trim() || !nama.trim()) {
      Alert.alert('Peringatan', 'Kode dan Nama Mata Kuliah wajib diisi!');
      return;
    }

    const sksNum = parseInt(sks, 10);
    const semNum = parseInt(semester, 10);

    if (isNaN(sksNum) || sksNum < 1 || sksNum > 6) {
      Alert.alert('Peringatan', 'SKS harus antara 1 sampai 6!');
      return;
    }

    if (isNaN(semNum) || semNum < 1 || semNum > 8) {
      Alert.alert('Peringatan', 'Semester harus antara 1 sampai 8!');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await MataKuliahService.update(id, {
          kode: kode.trim().toUpperCase(),
          nama: nama.trim(),
          sks: sksNum,
          semester: semNum,
          dosen_id: dosenId,
        });
        Alert.alert('Sukses', 'Mata kuliah berhasil diperbarui!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await MataKuliahService.create({
          kode: kode.trim().toUpperCase(),
          nama: nama.trim(),
          sks: sksNum,
          semester: semNum,
          dosen_id: dosenId,
        });
        Alert.alert('Sukses', 'Mata kuliah berhasil ditambahkan!', [
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
      <Text style={styles.label}>Kode Mata Kuliah *</Text>
      <TextInput
        style={styles.input}
        value={kode}
        onChangeText={setKode}
        placeholder="Contoh: IF101"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Nama Mata Kuliah *</Text>
      <TextInput
        style={styles.input}
        value={nama}
        onChangeText={setNama}
        placeholder="Contoh: Pemrograman Mobile"
        placeholderTextColor={colors.textTertiary}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Bobot SKS *</Text>
          <TextInput
            style={styles.input}
            value={sks}
            onChangeText={setSks}
            placeholder="1-6"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Semester Ditawarkan *</Text>
          <TextInput
            style={styles.input}
            value={semester}
            onChangeText={setSemester}
            placeholder="1-8"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Dosen Pengampu</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.chip,
              dosenId === null && styles.chipActive,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setDosenId(null)}
          >
            <Text style={[styles.chipText, dosenId === null && styles.chipTextActive]}>
              (Belum Ditentukan)
            </Text>
          </Pressable>
          {dosenList.map((d) => (
            <Pressable
              key={String(d.id)}
              style={({ pressed }) => [
                styles.chip,
                dosenId === d.id && styles.chipActive,
                pressed && styles.btnPressed,
              ]}
              onPress={() => setDosenId(d.id)}
            >
              <Text style={[styles.chipText, dosenId === d.id && styles.chipTextActive]}>
                {d.nama}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

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
          <Text style={styles.submitText}>{isEdit ? 'Perbarui Mata Kuliah' : 'Simpan Mata Kuliah'}</Text>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
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
});
