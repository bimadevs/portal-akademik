import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { Mahasiswa } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { PhotoAvatar } from '@/components/photo-avatar';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export default function KartuMahasiswaIndexScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const list = await MahasiswaService.getAll({ search });
      setStudents(list);
    } catch (err: any) {
      console.error('Gagal memuat data mahasiswa untuk kartu:', err);
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
      <View style={styles.header}>
        <Text style={styles.subtitle}>Pilih mahasiswa untuk menampilkan Kartu Tanda Mahasiswa (KTM)</Text>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama, NIM, atau fakultas..."
          onClear={() => setSearch('')}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="id-card-outline" size={56} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Mahasiswa Tidak Ditemukan</Text>
              <Text style={styles.emptySub}>Coba kata kunci pencarian lain</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/kartu/[mahasiswaId]',
                  params: { mahasiswaId: String(item.id) },
                })
              }
            >
              <PhotoAvatar
                uri={item.fotoUrl || (item as any).foto_url}
                size={48}
                shape="circle"
                name={item.nama}
                style={styles.avatar}
              />

              <View style={styles.info}>
                <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
                <Text style={styles.nim}>NIM: {item.nim}</Text>
                <View style={styles.tagRow}>
                  <View style={styles.fakultasBadge}>
                    <Text style={styles.fakultasText}>{item.fakultas}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === 'Aktif'
                            ? colors.successLight
                            : item.status === 'Cuti'
                            ? colors.warningLight
                            : colors.dangerLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.status === 'Aktif'
                              ? colors.success
                              : item.status === 'Cuti'
                              ? colors.warning
                              : colors.danger,
                        },
                      ]}
                    >
                      {item.status || 'Aktif'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          )}
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
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm + 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nama: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nim: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  fakultasBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  fakultasText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  arrowContainer: {
    paddingLeft: 4,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
