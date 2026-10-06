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
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { MataKuliah } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { colors, radius, shadows, spacing } from '@/theme';

export default function MataKuliahListScreen() {
  const router = useRouter();
  const [list, setList] = useState<MataKuliah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await MataKuliahService.getAll(search);
      setList(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat mata kuliah');
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
      'Hapus Mata Kuliah',
      `Yakin ingin menghapus mata kuliah ${nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await MataKuliahService.delete(id);
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
          placeholder="Cari kode atau nama matkul..."
          onClear={() => setSearch('')}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat kurikulum mata kuliah...</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Total <Text style={styles.boldText}>{list.length}</Text> mata kuliah kurikulum
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="book-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Mata Kuliah Tidak Ditemukan</Text>
              <Text style={styles.emptyText}>
                {search ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Belum ada mata kuliah.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/mata-kuliah/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Detail matkul ${item.nama}`}
            >
              <View style={styles.sksBadge}>
                <Text style={styles.sksNumber}>{item.sks}</Text>
                <Text style={styles.sksLabel}>SKS</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.kode}>{item.kode}</Text>
                  <Text style={styles.sem}>Semester {item.semester}</Text>
                </View>
                <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
                <Text style={styles.dosen} numberOfLines={1}>
                  Pengampu: {item.dosen_nama || 'Belum ditentukan'}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push(`/mata-kuliah/form?id=${item.id}`)}
                  style={styles.iconBtn}
                  hitSlop={8}
                  accessibilityLabel="Edit Mata Kuliah"
                >
                  <Ionicons name="create-outline" size={19} color={colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id, item.nama)}
                  style={styles.iconBtn}
                  hitSlop={8}
                  accessibilityLabel="Hapus Mata Kuliah"
                >
                  <Ionicons name="trash-outline" size={19} color={colors.danger} />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* FAB Tambah Mata Kuliah */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push('/mata-kuliah/form')}
        accessibilityRole="button"
        accessibilityLabel="Tambah Mata Kuliah Baru"
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
  sksBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primarySoft,
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
  info: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kode: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  sem: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  nama: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dosen: {
    fontSize: 12,
    color: colors.textSecondary,
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
