import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { SemesterService } from '../../services/semester-service';
import { KRSService } from '../../services/krs-service';
import { Mahasiswa, Semester } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { PhotoAvatar } from '../../components/photo-avatar';
import { colors, radius, shadows, spacing } from '@/theme';

export default function KRSListScreen() {
  const router = useRouter();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [krsStats, setKrsStats] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    try {
      const activeSem = await SemesterService.getActive();
      setActiveSemester(activeSem);

      const mhs = await MahasiswaService.getAll(search);
      setMahasiswaList(mhs);

      if (activeSem) {
        const stats: Record<string, number> = {};
        for (const m of mhs) {
          const totalSks = await KRSService.getTotalSks(m.id, activeSem.id);
          stats[String(m.id)] = totalSks;
        }
        setKrsStats(stats);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat data KRS');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={styles.container}>
      {/* Active Semester Banner */}
      <View style={styles.semBanner}>
        <View style={styles.semIconBox}>
          <Ionicons name="calendar" size={16} color={colors.primary} />
        </View>
        <View style={styles.semTextCol}>
          <Text style={styles.semLabel}>SEMESTER OPERASIONAL AKTIF</Text>
          <Text style={styles.semBold}>{activeSemester?.nama || 'Belum diatur'}</Text>
        </View>
      </View>

      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari NIM atau nama mahasiswa..."
          onClear={() => setSearch('')}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat data rencana studi...</Text>
        </View>
      ) : (
        <FlatList
          data={mahasiswaList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Pilih mahasiswa untuk mengelola kartu rencana studi (KRS)
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="school-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Mahasiswa Tidak Ditemukan</Text>
              <Text style={styles.emptyText}>
                {search ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Belum ada data mahasiswa.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const sks = krsStats[String(item.id)] || 0;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => router.push(`/krs/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`KRS ${item.nama}`}
              >
                <PhotoAvatar
                  uri={item.fotoUrl || (item as any).foto_url}
                  size={44}
                  name={item.nama}
                  shape="rounded"
                />
                <View style={styles.info}>
                  <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
                  <Text style={styles.nim}>NIM: {item.nim}</Text>
                  <Text style={styles.fakultas} numberOfLines={1}>
                    {item.prodi || item.fakultas}
                  </Text>
                </View>
                <View style={styles.sksBox}>
                  <Text style={styles.sksNumber}>{sks}</Text>
                  <Text style={styles.sksLabel}>SKS</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  semBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  semIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  semTextCol: {
    gap: 2,
  },
  semLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  semBold: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.sm,
  },
  summaryRow: {
    marginBottom: spacing.xs,
  },
  summaryText: {
    fontSize: 11,
    color: colors.textSecondary,
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
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nama: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nim: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fakultas: {
    fontSize: 11,
    color: colors.textMuted,
  },
  sksBox: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sksNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  sksLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    marginTop: -2,
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
});
