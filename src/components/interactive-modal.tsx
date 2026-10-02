import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Mahasiswa } from '@/types/mahasiswa';
import { PhotoAvatar } from './photo-avatar';
import { colors, radius, shadows, spacing } from '@/theme';

interface MahasiswaClickModalProps {
  visible: boolean;
  mahasiswa: Mahasiswa | null;
  onClose: () => void;
  onRequestDelete: (mahasiswa: Mahasiswa) => void;
}

export function MahasiswaClickModal({
  visible,
  mahasiswa,
  onClose,
  onRequestDelete,
}: MahasiswaClickModalProps) {
  if (!mahasiswa) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
          {/* Header Dialog */}
          <View style={styles.dialogHeader}>
            <PhotoAvatar
              uri={mahasiswa.fotoUrl || (mahasiswa as any).foto_url}
              size={44}
              shape="rounded"
              name={mahasiswa.nama}
            />

            <View style={styles.headerTitleCol}>
              <View style={styles.badgeRow}>
                <View style={styles.activeDot} />
                <Text style={styles.badgeLabel}>DETAIL MAHASISWA</Text>
              </View>
              <Text style={styles.studentHeaderName}>{mahasiswa.nama}</Text>
            </View>

            <Pressable onPress={onClose} hitSlop={8} style={styles.closeRoundBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Sesuai Spesifikasi Dosen & Mockup: "Yang anda Klik : [Nama] [NIM]" */}
          <View style={styles.clickMessageBox}>
            <Text style={styles.clickLabel}>Yang anda Klik :</Text>
            <Text style={styles.clickStudentTarget}>
              {mahasiswa.nama} {mahasiswa.nim}
            </Text>
          </View>

          {/* Student Metadata Card */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaItemLabel}>NIM / Kode</Text>
                <Text style={styles.metaItemValue}>{mahasiswa.nim}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaItemLabel}>Jenis Kelamin</Text>
                <Text style={styles.metaItemValue}>
                  {mahasiswa.jenisKelamin === 'PRIA' ? '👨 Laki-laki' : '👩 Perempuan'}
                </Text>
              </View>
            </View>

            <View style={styles.facultyRow}>
              <Text style={styles.metaItemLabel}>Fakultas</Text>
              <View style={styles.facultyChip}>
                <Ionicons name="school-outline" size={14} color={colors.primary} />
                <Text style={styles.facultyChipText} numberOfLines={1}>
                  {mahasiswa.fakultas}
                </Text>
              </View>
            </View>
          </View>

          {/* Dual Action Buttons Sesuai Spesifikasi */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onRequestDelete(mahasiswa)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Hapus Data Mahasiswa"
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={styles.deleteButtonText}>Hapus Data</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.okButtonWrapper,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="OK Tutup Dialog"
            >
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.okButtonGradient}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

interface DeleteConfirmationModalProps {
  visible: boolean;
  mahasiswa: Mahasiswa | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  visible,
  mahasiswa,
  onCancel,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!mahasiswa) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
          <View style={styles.dialogHeader}>
            <View style={styles.dangerIconCircle}>
              <Ionicons name="warning" size={24} color={colors.danger} />
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.dangerDialogTitle}>Konfirmasi Hapus</Text>
              <Text style={styles.dangerDialogSubtitle}>Tindakan ini permanen</Text>
            </View>
          </View>

          <View style={styles.deleteWarningBox}>
            <Text style={styles.confirmMessage}>
              Apakah Anda yakin ingin menghapus data{' '}
              <Text style={styles.boldText}>{mahasiswa.nama}</Text> (
              <Text style={styles.boldText}>{mahasiswa.nim}</Text>)?
            </Text>
            <Text style={styles.deleteWarningSubtext}>
              Data yang dihapus akan segera hilang dari penyimpanan lokal perangkat.
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={onCancel}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Batal Hapus"
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.dangerConfirmButton,
                pressed && styles.buttonPressed,
                isDeleting && { opacity: 0.6 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Konfirmasi Hapus Mahasiswa"
            >
              <Ionicons name="trash" size={15} color="#FFFFFF" />
              <Text style={styles.dangerConfirmButtonText}>
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    boxShadow: shadows.elevated,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: spacing.md,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTitleCol: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  studentHeaderName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeRoundBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickMessageBox: {
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 2,
  },
  clickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  clickStudentTarget: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  metaContainer: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaItemLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  facultyRow: {
    gap: 4,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  facultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignSelf: 'flex-start',
  },
  facultyChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.xl,
    flex: 1,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '700',
  },
  okButtonWrapper: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: shadows.glow,
  },
  okButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dangerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerDialogTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.danger,
  },
  dangerDialogSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteWarningBox: {
    backgroundColor: '#FEF2F2',
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '800',
  },
  deleteWarningSubtext: {
    fontSize: 11,
    color: '#B91C1C',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dangerConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: radius.xl,
    boxShadow: shadows.glow,
  },
  dangerConfirmButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

