import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DosenService } from '../../services/dosen-service';
import { Dosen } from '../../types/mahasiswa';
import { colors, radius, spacing, shadows } from '@/theme';
import { PhotoAvatar } from '@/components/photo-avatar';

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
        <ActivityIndicator size="large" color={colors.primary} />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <PhotoAvatar
          uri={dosen.fotoUrl || (dosen as any).foto_url}
          size={84}
          name={dosen.nama}
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.nama}>{dosen.nama}</Text>
        {dosen.gelar ? <Text style={styles.gelar}>{dosen.gelar}</Text> : null}
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
          <Text style={styles.val}>{dosen.prodi || '-'}</Text>
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

      <Pressable
        style={({ pressed }) => [
          styles.editBtn,
          pressed && styles.btnPressed,
        ]}
        onPress={() => router.push(`/dosen/form?id=${dosen.id}`)}
      >
        <Ionicons name="create-outline" size={18} color="#FFFFFF" />
        <Text style={styles.editBtnText}>Edit Profil Dosen</Text>
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
  profileCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  nama: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gelar: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
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
