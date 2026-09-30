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
import { SemesterService } from '../../services/semester-service';
import { MataKuliah, Semester } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

export default function PresensiMatkulListScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<MataKuliah[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const activeSem = await SemesterService.getActive();
      setSemester(activeSem);
      const data = await MataKuliahService.getAll();
      setCourses(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memuat mata kuliah');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={20} color={UBD_COLORS.PRIMARY} />
        <Text style={styles.bannerText}>
          Pilih Mata Kuliah untuk Input Presensi ({semester?.nama || 'Semester Aktif'})
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <View style={styles.tagRow}>
                  <Text style={styles.kodeTag}>{item.kode}</Text>
                  <Text style={styles.sksTag}>{item.sks} SKS</Text>
                </View>
                <Text style={styles.nama}>{item.nama}</Text>
                <Text style={styles.dosen}>Dosen: {item.dosen_nama || '-'}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() =>
                    router.push({
                      pathname: '/presensi/checklist',
                      params: { mataKuliahId: item.id, nama: item.nama },
                    })
                  }
                >
                  <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnTextPrimary}>Presensi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() =>
                    router.push({
                      pathname: '/presensi/rekap',
                      params: { mataKuliahId: item.id, nama: item.nama },
                    })
                  }
                >
                  <Ionicons name="stats-chart-outline" size={16} color={UBD_COLORS.PRIMARY} />
                  <Text style={styles.actionBtnTextOutline}>Rekap</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  info: {
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  kodeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sksTag: {
    fontSize: 11,
    color: '#64748B',
    paddingVertical: 2,
  },
  nama: {
    fontSize: 15,
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
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UBD_COLORS.PRIMARY,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnTextOutline: {
    color: UBD_COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
