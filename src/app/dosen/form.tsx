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
import { DosenService } from '../../services/dosen-service';
import { FAKULTAS_OPTIONS, Fakultas } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

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
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Edit Dosen' : 'Tambah Dosen Baru'}</Text>

      <Text style={styles.label}>NIDN *</Text>
      <TextInput
        style={styles.input}
        value={nidn}
        onChangeText={setNidn}
        placeholder="Contoh: 0412038501"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Nama Lengkap *</Text>
      <TextInput
        style={styles.input}
        value={nama}
        onChangeText={setNama}
        placeholder="Contoh: Dr. Budi Santoso"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>Gelar Akademik</Text>
      <TextInput
        style={styles.input}
        value={gelar}
        onChangeText={setGelar}
        placeholder="Contoh: M.Kom., Ph.D."
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>Fakultas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipGroup}>
          {FAKULTAS_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, fakultas === f && styles.chipActive]}
              onPress={() => setFakultas(f)}
            >
              <Text style={[styles.chipText, fakultas === f && styles.chipTextActive]}>
                {f.replace('Fakultas ', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.label}>Program Studi *</Text>
      <TextInput
        style={styles.input}
        value={prodi}
        onChangeText={setProdi}
        placeholder="Contoh: Teknik Informatika"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Contoh: dosen@budiluhur.ac.id"
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>No. Handphone / WhatsApp</Text>
      <TextInput
        style={styles.input}
        value={noHp}
        onChangeText={setNoHp}
        placeholder="Contoh: 08123456789"
        placeholderTextColor="#94A3B8"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>{isEdit ? 'Perbarui Data' : 'Simpan Dosen'}</Text>
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
  chipScroll: {
    marginBottom: 6,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
