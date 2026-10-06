import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MataKuliahService } from '../../services/mata-kuliah-service';
import { MataKuliah } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

      <Pressable
        style={({ pressed }) => [
          styles.editBtn,
          pressed && styles.btnPressed,
        ]}
        onPress={() => router.push(`/mata-kuliah/form?id=${mk.id}`)}
      >
        <Ionicons name="create-outline" size={18} color="#FFFFFF" />
        <Text style={styles.editBtnText}>Edit Mata Kuliah</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  cardHeader: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  badge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  nama: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  val: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    width: '100%',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    color: colors.textTertiary,
    fontSize: 16,
  },
});
