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
import { useRouter } from 'expo-router';
import { JadwalService } from '../../services/jadwal-service';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { MataKuliah, Hari, HARI_OPTIONS } from '../../types/mahasiswa';
import { colors, radius, spacing } from '@/theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Pilih Mata Kuliah *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipGroup}>
          {mataKuliahList.map((m) => (
            <Pressable
              key={String(m.id)}
              style={({ pressed }) => [
                styles.chip,
                selectedMatkulId === m.id && styles.chipActive,
                pressed && styles.btnPressed,
              ]}
              onPress={() => setSelectedMatkulId(m.id)}
            >
              <Text style={[styles.chipText, selectedMatkulId === m.id && styles.chipTextActive]}>
                {m.kode} - {m.nama}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.label}>Hari Perkuliahan *</Text>
      <View style={styles.daysRow}>
        {HARI_OPTIONS.map((h) => (
          <Pressable
            key={h}
            style={({ pressed }) => [
              styles.dayChip,
              hari === h && styles.dayChipActive,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setHari(h)}
          >
            <Text style={[styles.dayChipText, hari === h && styles.dayChipTextActive]}>
              {h}
            </Text>
          </Pressable>
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
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Jam Selesai *</Text>
          <TextInput
            style={styles.input}
            value={jamSelesai}
            onChangeText={setJamSelesai}
            placeholder="10:30"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <Text style={styles.label}>Ruangan / Ruang Kelas *</Text>
      <TextInput
        style={styles.input}
        value={ruangan}
        onChangeText={setRuangan}
        placeholder="Contoh: Lab Komputer 1, R. 4.2.1"
        placeholderTextColor={colors.textTertiary}
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
          <Text style={styles.submitText}>Simpan Jadwal Perkuliahan</Text>
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
  chipScroll: {
    marginBottom: 4,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
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
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: 4,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
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
