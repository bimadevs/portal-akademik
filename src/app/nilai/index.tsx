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
import { NilaiService } from '../../services/nilai-service';
import { Mahasiswa, Semester } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { PhotoAvatar } from '../../components/photo-avatar';
import { colors, radius, spacing, shadows } from '@/theme';

export default function NilaiListScreen() {
  const router = useRouter();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [ipsMap, setIpsMap] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    try {
      const activeSem = await SemesterService.getActive();
      setSemester(activeSem);

      const mhs = await MahasiswaService.getAll(search);
      setMahasiswaList(mhs);

      if (activeSem) {
        const ipsRecord: Record<string, number> = {};
        for (const m of mhs) {
          const res = await NilaiService.hitungIPS(m.id, activeSem.id);
          ipsRecord[String(m.id)] = res.ips;
        }
        setIpsMap(ipsRecord);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat nilai mahasiswa');
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
      <View style={styles.banner}>
        <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
        <Text style={styles.bannerText}>
          Penilaian & KHS Mahasiswa ({semester?.nama || 'Semester Aktif'})
        </Text>
      </View>

      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari NIM atau nama mahasiswa..."
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={mahasiswaList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const ips = ipsMap[String(item.id)] || 0;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => router.push(`/nilai/${item.id}`)}
              >
                <PhotoAvatar
                  uri={item.fotoUrl || (item as any).foto_url}
                  size={46}
                  name={item.nama}
                  shape="rounded"
                />
                <View style={styles.info}>
                  <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
                  <Text style={styles.nim}>NIM: {item.nim}</Text>
                  <Text style={styles.prodi}>{item.prodi || item.fakultas}</Text>
                </View>
                <View style={styles.ipsBox}>
                  <Text style={styles.ipsNumber}>{ips.toFixed(2)}</Text>
                  <Text style={styles.ipsLabel}>IPS</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  bannerText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nama: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nim: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prodi: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  ipsBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    minWidth: 48,
  },
  ipsNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  ipsLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
