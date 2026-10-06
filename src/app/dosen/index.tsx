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
import { DosenService } from '../../services/dosen-service';
import { Dosen } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { PhotoAvatar } from '@/components/photo-avatar';
import { colors, radius, shadows, spacing } from '@/theme';

export default function DosenListScreen() {
  const router = useRouter();
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await DosenService.getAll(search);
      setDosenList(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat data dosen');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (id: string | number, nama: string) => {
    Alert.alert(
      'Hapus Dosen',
      `Yakin ingin menghapus data dosen ${nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await DosenService.delete(id);
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
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari NIDN, nama, atau fakultas..."
          onClear={() => setSearch('')}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat data dosen...</Text>
        </View>
      ) : (
        <FlatList
          data={dosenList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Total <Text style={styles.boldText}>{dosenList.length}</Text> dosen pengampu terdaftar
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Dosen Tidak Ditemukan</Text>
              <Text style={styles.emptyText}>
                {search ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Belum ada data dosen.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/dosen/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Detail dosen ${item.nama}`}
            >
              <PhotoAvatar
                uri={item.fotoUrl || (item as any).foto_url}
                size={44}
                name={item.nama}
                shape="rounded"
              />
              <View style={styles.info}>
                <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
                <Text style={styles.nidn}>NIDN: {item.nidn}</Text>
                <View style={styles.prodiBadge}>
                  <Text style={styles.prodiText} numberOfLines={1}>
                    {item.prodi || item.fakultas}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push(`/dosen/form?id=${item.id}`)}
                  style={styles.iconBtn}
                  hitSlop={8}
                  accessibilityLabel="Edit Dosen"
                >
                  <Ionicons name="create-outline" size={19} color={colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id, item.nama)}
                  style={styles.iconBtn}
                  hitSlop={8}
                  accessibilityLabel="Hapus Dosen"
                >
                  <Ionicons name="trash-outline" size={19} color={colors.danger} />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* FAB Tambah Dosen */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push('/dosen/form')}
        accessibilityRole="button"
        accessibilityLabel="Tambah Dosen Baru"
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nama: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nidn: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prodiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  prodiText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
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
