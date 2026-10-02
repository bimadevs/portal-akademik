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
import { MahasiswaService } from '../../services/mahasiswa-service';
import { SemesterService } from '../../services/semester-service';
import { KRSService } from '../../services/krs-service';
import { Mahasiswa, Semester } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { PhotoAvatar } from '../../components/photo-avatar';
import { UBD_COLORS } from '../../constants/theme';

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
      <View style={styles.semBanner}>
        <Ionicons name="information-circle-outline" size={20} color={UBD_COLORS.PRIMARY} />
        <Text style={styles.semText}>
          Semester Aktif: <Text style={styles.semBold}>{activeSemester?.nama || '-'}</Text>
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
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={mahasiswaList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Tidak ada mahasiswa</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sks = krsStats[String(item.id)] || 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/krs/${item.id}`)}
                activeOpacity={0.7}
              >
                <PhotoAvatar
                  uri={item.fotoUrl || (item as any).foto_url}
                  size={44}
                  name={item.nama}
                  shape="rounded"
                />
                <View style={styles.info}>
                  <Text style={styles.nama}>{item.nama}</Text>
                  <Text style={styles.nim}>NIM: {item.nim}</Text>
                  <Text style={styles.fakultas}>{item.prodi || item.fakultas}</Text>
                </View>
                <View style={styles.sksBox}>
                  <Text style={styles.sksNumber}>{sks}</Text>
                  <Text style={styles.sksLabel}>SKS Diambil</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  semBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  semText: {
    fontSize: 13,
    color: '#0369A1',
  },
  semBold: {
    fontWeight: '700',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  listContent: {
    padding: 16,
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
  nim: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  fakultas: {
    fontSize: 12,
    color: UBD_COLORS.ACCENT_DARK,
    fontWeight: '500',
    marginTop: 2,
  },
  sksBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  sksNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: UBD_COLORS.PRIMARY,
  },
  sksLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
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
});
