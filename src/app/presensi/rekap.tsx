import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PresensiService, RekapPresensi } from '../../services/presensi-service';
import { SemesterService } from '../../services/semester-service';
import { UBD_COLORS } from '../../constants/theme';

export default function PresensiRekapScreen() {
  const { mataKuliahId, nama } = useLocalSearchParams<{
    mataKuliahId: string;
    nama: string;
  }>();

  const [rekapList, setRekapList] = useState<RekapPresensi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!mataKuliahId) return;
        const sem = await SemesterService.getActive();
        if (sem) {
          const list = await PresensiService.getRekapByMataKuliah(mataKuliahId, sem.id);
          setRekapList(list);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Gagal memuat rekap presensi');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mataKuliahId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rekap Presensi Mahasiswa</Text>
        <Text style={styles.sub}>{nama}</Text>
      </View>

      <FlatList
        data={rekapList}
        keyExtractor={(item, index) => String(item.mahasiswa_id ?? index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Belum ada data rekap presensi</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSafe = item.persentase >= 75;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentNama}>{item.mahasiswa_nama}</Text>
                  <Text style={styles.studentNim}>NIM: {item.mahasiswa_nim}</Text>
                </View>
                <View
                  style={[
                    styles.pctBadge,
                    { backgroundColor: isSafe ? '#DCFCE7' : '#FEE2E2' },
                  ]}
                >
                  <Text
                    style={[
                      styles.pctText,
                      { color: isSafe ? '#166534' : '#991B1B' },
                    ]}
                  >
                    {item.persentase}%
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.hadir}</Text>
                  <Text style={styles.statLabel}>Hadir</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.izin}</Text>
                  <Text style={styles.statLabel}>Izin</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.sakit}</Text>
                  <Text style={styles.statLabel}>Sakit</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.alfa}</Text>
                  <Text style={styles.statLabel}>Alfa</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.total_pertemuan}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
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
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentNama: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentNim: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pctText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
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
  },
});
