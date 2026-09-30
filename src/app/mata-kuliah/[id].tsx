import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { MataKuliah } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

export default function MataKuliahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [mk, setMk] = useState<MataKuliah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      MataKuliahService.getById(id)
        .then(setMk)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  if (!mk) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Mata kuliah tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{mk.kode}</Text>
        </View>
        <Text style={styles.nama}>{mk.nama}</Text>
        <Text style={styles.sub}>
          {mk.sks} SKS • Semester {mk.semester}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Informasi Mata Kuliah</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Kode Mata Kuliah</Text>
          <Text style={styles.val}>{mk.kode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bobot SKS</Text>
          <Text style={styles.val}>{mk.sks} SKS</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Semester Ditawarkan</Text>
          <Text style={styles.val}>Semester {mk.semester}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dosen Pengampu</Text>
          <Text style={styles.val}>{mk.dosen_nama || 'Belum Ditentukan'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => router.push(`/mata-kuliah/form?id=${mk.id}`)}
      >
        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        <Text style={styles.editBtnText}>Edit Mata Kuliah</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  nama: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
  },
  val: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: UBD_COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    color: '#64748B',
    fontSize: 16,
  },
});
