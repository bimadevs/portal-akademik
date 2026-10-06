import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { JadwalService } from '../../services/jadwal-service';
import { Jadwal, Hari, HARI_OPTIONS } from '../../types/mahasiswa';
import { colors, radius, shadows, spacing } from '@/theme';

export default function JadwalListScreen() {
  const router = useRouter();
  const [selectedHari, setSelectedHari] = useState<Hari | 'SEMUA'>('SEMUA');
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await JadwalService.getAll(
        selectedHari === 'SEMUA' ? undefined : selectedHari
      );
      setJadwalList(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  }, [selectedHari]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (id: string | number, matkul: string) => {
    Alert.alert(
      'Hapus Jadwal',
      `Yakin ingin menghapus jadwal ${matkul}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await JadwalService.delete(id);
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Gagal menghapus');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Day Filter Bar */}
      <View style={styles.chipBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        >
          <Pressable
            style={({ pressed }) => [
              styles.chip,
              selectedHari === 'SEMUA' && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
            onPress={() => setSelectedHari('SEMUA')}
          >
            <Text
              style={[
                styles.chipText,
                selectedHari === 'SEMUA' && styles.chipTextActive,
              ]}
            >
              Semua Hari
            </Text>
          </Pressable>
          {HARI_OPTIONS.map((hari) => (
            <Pressable
              key={hari}
              style={({ pressed }) => [
                styles.chip,
                selectedHari === hari && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => setSelectedHari(hari)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedHari === hari && styles.chipTextActive,
                ]}
              >
                {hari}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat jadwal perkuliahan...</Text>
        </View>
      ) : (
        <FlatList
          data={jadwalList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Ditemukan <Text style={styles.boldText}>{jadwalList.length}</Text> sesi perkuliahan
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Tidak Ada Jadwal Kuliah</Text>
              <Text style={styles.emptyText}>
                {selectedHari !== 'SEMUA'
                  ? `Tidak ada sesi perkuliahan di hari ${selectedHari}.`
                  : 'Belum ada jadwal yang terdaftar.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeBox}>
                <Text style={styles.hariText}>{item.hari.toUpperCase()}</Text>
                <Text style={styles.jamText}>
                  {item.jam_mulai} - {item.jam_selesai}
                </Text>
              </View>

              <View style={styles.info}>
                <View style={styles.badgeRow}>
                  <View style={styles.ruangBadge}>
                    <Ionicons name="location-outline" size={11} color={colors.primary} />
                    <Text style={styles.ruangText}>{item.ruangan}</Text>
                  </View>
                  <Text style={styles.sksText}>{item.mata_kuliah_sks} SKS</Text>
                </View>
                <Text style={styles.matkul} numberOfLines={1}>{item.mata_kuliah_nama}</Text>
                <Text style={styles.dosen} numberOfLines={1}>
                  {item.dosen_nama || 'Dosen belum ditentukan'}
                </Text>
              </View>

              <Pressable
                onPress={() => handleDelete(item.id, item.mata_kuliah_nama || 'jadwal')}
                style={styles.deleteBtn}
                hitSlop={8}
                accessibilityLabel="Hapus Jadwal"
              >
                <Ionicons name="trash-outline" size={19} color={colors.danger} />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* FAB Tambah Jadwal */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push('/jadwal/form')}
        accessibilityRole="button"
        accessibilityLabel="Tambah Jadwal Baru"
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chipBar: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 90,
    gap: spacing.sm,
  },
  summaryRow: {
    marginBottom: spacing.xs,
  },
  summaryText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.subtle,
    gap: spacing.md,
  },
  timeBox: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 2,
  },
  hariText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  jamText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruangBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  ruangText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sksText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  matkul: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dosen: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    gap: 4,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.cardElevated,
  },
  fabPressed: {
    backgroundColor: colors.primaryHover,
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
