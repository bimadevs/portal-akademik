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
import { useRouter } from 'expo-router';
import { JadwalService } from '../../services/jadwal-service';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { MataKuliah, Hari, HARI_OPTIONS } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

export default function JadwalFormScreen() {
  const router = useRouter();
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [selectedMatkulId, setSelectedMatkulId] = useState<string | number>('');
  const [hari, setHari] = useState<Hari>('Senin');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:30');
  const [ruangan, setRuangan] = useState('Lab Komputer 1');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MataKuliahService.getAll()
      .then((mks) => {
        setMataKuliahList(mks);
        if (mks.length > 0) {
          setSelectedMatkulId(mks[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedMatkulId) {
      Alert.alert('Peringatan', 'Pilih mata kuliah terlebih dahulu!');
      return;
    }

    if (!jamMulai.trim() || !jamSelesai.trim() || !ruangan.trim()) {
      Alert.alert('Peringatan', 'Harap lengkapi jam mulai, jam selesai, dan ruangan!');
      return;
    }

    setSaving(true);
    try {
      // Periksa bentrok jadwal ruangan
      const conflict = await JadwalService.checkConflict(
        hari,
        ruangan.trim(),
        jamMulai.trim(),
        jamSelesai.trim()
      );

      if (conflict) {
        Alert.alert(
          'Bentrok Jadwal Terdeteksi!',
          `Ruangan ${ruangan} sudah digunakan oleh mata kuliah "${conflict.mata_kuliah_nama}" pada ${conflict.hari} jam ${conflict.jam_mulai} - ${conflict.jam_selesai}. Silakan pilih ruangan atau jam lain.`
        );
        setSaving(false);
        return;
      }

      await JadwalService.create({
        mata_kuliah_id: selectedMatkulId,
        hari,
        jam_mulai: jamMulai.trim(),
        jam_selesai: jamSelesai.trim(),
        ruangan: ruangan.trim(),
      });

      Alert.alert('Sukses', 'Jadwal kuliah berhasil ditambahkan!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
      <Text style={styles.title}>Tambah Jadwal Kuliah</Text>

      <Text style={styles.label}>Pilih Mata Kuliah *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipGroup}>
          {mataKuliahList.map((m) => (
            <TouchableOpacity
              key={String(m.id)}
              style={[styles.chip, selectedMatkulId === m.id && styles.chipActive]}
              onPress={() => setSelectedMatkulId(m.id)}
            >
              <Text style={[styles.chipText, selectedMatkulId === m.id && styles.chipTextActive]}>
                {m.kode} - {m.nama}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.label}>Hari *</Text>
      <View style={styles.daysRow}>
        {HARI_OPTIONS.map((h) => (
          <TouchableOpacity
            key={h}
            style={[styles.dayChip, hari === h && styles.dayChipActive]}
            onPress={() => setHari(h)}
          >
            <Text style={[styles.dayChipText, hari === h && styles.dayChipTextActive]}>
              {h}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Jam Mulai *</Text>
          <TextInput
            style={styles.input}
            value={jamMulai}
            onChangeText={setJamMulai}
            placeholder="08:00"
            placeholderTextColor="#94A3B8"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Jam Selesai *</Text>
          <TextInput
            style={styles.input}
            value={jamSelesai}
            onChangeText={setJamSelesai}
            placeholder="10:30"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <Text style={styles.label}>Ruangan / Ruang Kelas *</Text>
      <TextInput
        style={styles.input}
        value={ruangan}
        onChangeText={setRuangan}
        placeholder="Contoh: Lab Komputer 1, R. 4.2.1"
        placeholderTextColor="#94A3B8"
      />

      <TouchableOpacity
        style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>Simpan Jadwal</Text>
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
    borderRadius: 16,
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
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  dayChipActive: {
    backgroundColor: UBD_COLORS.PRIMARY,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
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
