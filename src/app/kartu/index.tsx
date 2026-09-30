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
import { LinearGradient } from 'expo-linear-gradient';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { Mahasiswa } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { UBD_COLORS } from '../../constants/theme';

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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Kartu Mahasiswa Digital</Text>
        </View>
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
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="id-card-outline" size={56} color="#94A3B8" />
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
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {item.nama.slice(0, 2).toUpperCase()}
                </Text>
              </LinearGradient>

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
                            ? '#DCFCE7'
                            : item.status === 'Cuti'
                            ? '#FEF9C3'
                            : '#FEE2E2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.status === 'Aktif'
                              ? '#166534'
                              : item.status === 'Cuti'
                              ? '#854D0E'
                              : '#991B1B',
                        },
                      ]}
                    >
                      {item.status || 'Aktif'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nama: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  nim: {
    fontSize: 13,
    color: '#64748B',
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
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fakultasText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
});
