import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DosenService } from '../../services/dosen-service';
import { Dosen } from '../../types/mahasiswa';
import { UBD_COLORS } from '../../constants/theme';

export default function DosenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [dosen, setDosen] = useState<Dosen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      DosenService.getById(id)
        .then(setDosen)
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

  if (!dosen) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Dosen tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={UBD_COLORS.PRIMARY} />
        </View>
        <Text style={styles.nama}>{dosen.nama}</Text>
        {dosen.gelar && <Text style={styles.gelar}>{dosen.gelar}</Text>}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{dosen.fakultas}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Informasi Akademik</Text>
        <View style={styles.row}>
          <Text style={styles.label}>NIDN</Text>
          <Text style={styles.val}>{dosen.nidn}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Program Studi</Text>
          <Text style={styles.val}>{dosen.prodi}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.val}>{dosen.email || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>No. Telepon / WA</Text>
          <Text style={styles.val}>{dosen.no_hp || '-'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => router.push(`/dosen/form?id=${dosen.id}`)}
      >
        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        <Text style={styles.editBtnText}>Edit Profil Dosen</Text>
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
  profileCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nama: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  gelar: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
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
