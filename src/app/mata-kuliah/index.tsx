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
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { MataKuliah } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { UBD_COLORS } from '../../constants/theme';

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
      `Yakin ingin menghapus ${nama}?`,
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
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="book-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Tidak ada mata kuliah ditemukan</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/mata-kuliah/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.sksBadge}>
                <Text style={styles.sksNumber}>{item.sks}</Text>
                <Text style={styles.sksLabel}>SKS</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.kode}>{item.kode}</Text>
                  <Text style={styles.sem}>Sem {item.semester}</Text>
                </View>
                <Text style={styles.nama}>{item.nama}</Text>
                <Text style={styles.dosen}>
                  Pengampu: {item.dosen_nama || 'Belum ditentukan'}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => router.push(`/mata-kuliah/form?id=${item.id}`)}
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
        onPress={() => router.push('/mata-kuliah/form')}
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
  sksBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sksNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: UBD_COLORS.PRIMARY,
  },
  sksLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284C7',
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  kode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sem: {
    fontSize: 11,
    color: '#64748B',
  },
  nama: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dosen: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
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
