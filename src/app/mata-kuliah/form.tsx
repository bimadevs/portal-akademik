import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { DosenService } from '../../services/dosen-service';
import { Dosen } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</Text>

      <Text style={styles.label}>Kode Mata Kuliah *</Text>
      <TextInput
        style={styles.input}
        value={kode}
        onChangeText={setKode}
        placeholder="Contoh: IF101"
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Nama Mata Kuliah *</Text>
      <TextInput
        style={styles.input}
        value={nama}
        onChangeText={setNama}
        placeholder="Contoh: Pemrograman Mobile"
        placeholderTextColor="#94A3B8"
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>SKS *</Text>
          <TextInput
            style={styles.input}
            value={sks}
            onChangeText={setSks}
            placeholder="1-6"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Semester *</Text>
          <TextInput
            style={styles.input}
            value={semester}
            onChangeText={setSemester}
            placeholder="1-8"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Dosen Pengampu</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipGroup}>
          <TouchableOpacity
            style={[styles.chip, dosenId === null && styles.chipActive]}
            onPress={() => setDosenId(null)}
          >
            <Text style={[styles.chipText, dosenId === null && styles.chipTextActive]}>
              (Belum Ditentukan)
            </Text>
          </TouchableOpacity>
          {dosenList.map((d) => (
            <TouchableOpacity
              key={String(d.id)}
              style={[styles.chip, dosenId === d.id && styles.chipActive]}
              onPress={() => setDosenId(d.id)}
            >
              <Text style={[styles.chipText, dosenId === d.id && styles.chipTextActive]}>
                {d.nama}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>{isEdit ? 'Perbarui Data' : 'Simpan Mata Kuliah'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  chipScroll: {
    marginBottom: 6,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: UBD_COLORS.PRIMARY,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: UBD_COLORS.PRIMARY,
    borderRadius: 10,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
