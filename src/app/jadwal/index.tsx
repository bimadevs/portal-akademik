import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { JadwalService } from '../../services/jadwal-service';
import { Jadwal, Hari, HARI_OPTIONS } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

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
      <View style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipList}>
          <TouchableOpacity
            style={[styles.chip, selectedHari === 'SEMUA' && styles.chipActive]}
            onPress={() => setSelectedHari('SEMUA')}
          >
            <Text style={[styles.chipText, selectedHari === 'SEMUA' && styles.chipTextActive]}>
              Semua Hari
            </Text>
          </TouchableOpacity>
          {HARI_OPTIONS.map((hari) => (
            <TouchableOpacity
              key={hari}
              style={[styles.chip, selectedHari === hari && styles.chipActive]}
              onPress={() => setSelectedHari(hari)}
            >
              <Text style={[styles.chipText, selectedHari === hari && styles.chipTextActive]}>
                {hari}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={jadwalList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Tidak ada jadwal kuliah</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeBox}>
                <Text style={styles.hariText}>{item.hari}</Text>
                <Text style={styles.jamText}>
                  {item.jam_mulai} - {item.jam_selesai}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.badgeRow}>
                  <Text style={styles.ruangBadge}>{item.ruangan}</Text>
                  <Text style={styles.sksText}>{item.mata_kuliah_sks} SKS</Text>
                </View>
                <Text style={styles.matkul}>{item.mata_kuliah_nama}</Text>
                <Text style={styles.dosen}>
                  {item.dosen_nama || 'Dosen belum ditentukan'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.mata_kuliah_nama || 'jadwal')}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/jadwal/form')}
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
  chipBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: UBD_COLORS.PRIMARY,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeBox: {
    width: 95,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hariText: {
    fontSize: 13,
    fontWeight: '800',
    color: UBD_COLORS.PRIMARY,
  },
  jamText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ruangBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sksText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  matkul: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dosen: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  deleteBtn: {
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
