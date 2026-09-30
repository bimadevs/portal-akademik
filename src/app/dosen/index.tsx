import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DosenService } from '../../services/dosen-service';
import { Dosen } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { UBD_COLORS } from '../../constants/theme';

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
      `Yakin ingin menghapus dosen ${nama}?`,
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
          placeholder="Cari NIDN, nama, atau prodi..."
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={dosenList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Tidak ada data dosen ditemukan</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/dosen/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={UBD_COLORS.PRIMARY} />
              </View>
              <View style={styles.info}>
                <Text style={styles.nama}>{item.nama}</Text>
                <Text style={styles.nidn}>NIDN: {item.nidn}</Text>
                <Text style={styles.prodi}>{item.prodi}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => router.push(`/dosen/form?id=${item.id}`)}
                  style={styles.iconBtn}
                >
                  <Ionicons name="create-outline" size={20} color="#0284C7" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.nama)}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/dosen/form')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nama: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  nidn: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  prodi: {
    fontSize: 12,
    color: UBD_COLORS.ACCENT_DARK,
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UBD_COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
