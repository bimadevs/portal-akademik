import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Mahasiswa } from '@/types/mahasiswa';
import { PhotoAvatar } from './photo-avatar';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

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
              <Text style={styles.badgeLabel}>DETAIL INFORMASI MAHASISWA</Text>
              <Text style={styles.studentHeaderName}>{mahasiswa.nama}</Text>
            </View>

            <Pressable onPress={onClose} hitSlop={8} style={styles.closeRoundBtn}>
              <Ionicons name="close" size={19} color={colors.textSecondary} />
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
                  {mahasiswa.jenisKelamin === 'PRIA' ? 'Laki-laki (PRIA)' : 'Perempuan (WANITA)'}
                </Text>
              </View>
            </View>

            <View style={styles.facultyRow}>
              <Text style={styles.metaItemLabel}>Fakultas</Text>
              <View style={styles.facultyChip}>
                <Ionicons name="school-outline" size={13} color={colors.primary} />
                <Text style={styles.facultyChipText} numberOfLines={1}>
                  {mahasiswa.fakultas}
                </Text>
              </View>
            </View>
          </View>

          {/* Dual Action Buttons Sesuai Spesifikasi Mockup */}
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
                styles.okButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="OK Tutup Dialog"
            >
              <Text style={styles.okButtonText}>OK</Text>
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
          <View style={styles.deleteHeaderIconBox}>
            <Ionicons name="alert-circle" size={28} color={colors.danger} />
          </View>

          <Text style={styles.deleteCardTitle}>Konfirmasi Hapus Data</Text>
          <Text style={styles.deleteCardDesc}>
            Apakah Anda yakin ingin menghapus data mahasiswa{' '}
            <Text style={styles.boldText}>{mahasiswa.nama}</Text> ({mahasiswa.nim})? Tindakan ini tidak dapat dibatalkan.
          </Text>

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
                styles.confirmDeleteButton,
                pressed && styles.buttonPressed,
                isDeleting && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Konfirmasi Hapus"
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.confirmDeleteButtonText}>Hapus</Text>
              )}
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
    backgroundColor: 'rgba(28, 25, 23, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.modal,
    gap: spacing.md,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitleCol: {
    flex: 1,
    gap: 2,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  studentHeaderName: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeRoundBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickMessageBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    gap: 3,
  },
  clickLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  clickStudentTarget: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  metaContainer: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    gap: 2,
  },
  metaItemLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaItemValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  facultyRow: {
    gap: 3,
  },
  facultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  facultyChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  okButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteHeaderIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  deleteCardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  deleteCardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmDeleteButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
});
