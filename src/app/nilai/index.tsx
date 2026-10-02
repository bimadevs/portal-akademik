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
import { NilaiService } from '../../services/nilai-service';
import { Mahasiswa, Semester } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { PhotoAvatar } from '../../components/photo-avatar';
import { UBD_COLORS } from '../../constants/theme';

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
        <Ionicons name="ribbon-outline" size={20} color={UBD_COLORS.PRIMARY} />
        <Text style={styles.bannerText}>
          Penilaian & KHS Mahasiswa ({semester?.nama || 'Semester Aktif'})
        </Text>
      </View>

      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari NIM atau nama..."
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
          renderItem={({ item }) => {
            const ips = ipsMap[String(item.id)] || 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/nilai/${item.id}`)}
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
                  <Text style={styles.prodi}>{item.prodi || item.fakultas}</Text>
                </View>
                <View style={styles.ipsBox}>
                  <Text style={styles.ipsNumber}>{ips.toFixed(2)}</Text>
                  <Text style={styles.ipsLabel}>IPS</Text>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    color: '#92400E',
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
  prodi: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  ipsBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  ipsNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: UBD_COLORS.ACCENT_DARK,
  },
  ipsLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
