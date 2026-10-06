import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FAKULTAS_OPTIONS, Fakultas } from '@/types/mahasiswa';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

interface FacultyPickerProps {
  value: Fakultas;
  onChange: (value: Fakultas) => void;
  disabled?: boolean;
}

interface FacultyMeta {
  name: Fakultas;
  shortName: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
}

const FACULTY_META: Record<Fakultas, FacultyMeta> = {
  'Sains dan Teknologi': {
    name: 'Sains dan Teknologi',
    shortName: 'FST',
    icon: 'laptop-outline',
    color: colors.faculty.saintek,
    bgLight: colors.faculty.saintekLight,
  },
  'Bisnis': {
    name: 'Bisnis',
    shortName: 'FB',
    icon: 'briefcase-outline',
    color: colors.faculty.bisnis,
    bgLight: colors.faculty.bisnisLight,
  },
  'Ilmu Komunikasi dan Desain': {
    name: 'Ilmu Komunikasi dan Desain',
    shortName: 'FIKD',
    icon: 'color-palette-outline',
    color: colors.faculty.komunikasi,
    bgLight: colors.faculty.komunikasiLight,
  },
  'Sosial dan Humaniora': {
    name: 'Sosial dan Humaniora',
    shortName: 'FSH',
    icon: 'people-outline',
    color: colors.faculty.soshum,
    bgLight: colors.faculty.soshumLight,
  },
};

export function FacultyPicker({
  value,
  onChange,
  disabled = false,
}: FacultyPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const currentMeta = FACULTY_META[value] ?? FACULTY_META['Sains dan Teknologi'];

  const handleSelect = (option: Fakultas) => {
    onChange(option);
    setModalVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Fakultas</Text>

      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        style={({ pressed }) => [
          styles.triggerBox,
          pressed && !disabled && styles.triggerBoxPressed,
          disabled && styles.triggerBoxDisabled,
        ]}
        accessibilityRole="combobox"
        accessibilityLabel={`Pilih Fakultas: ${value}`}
      >
        <View style={styles.triggerLeft}>
          <View style={[styles.facultyIconBox, { backgroundColor: currentMeta.bgLight }]}>
            <Ionicons name={currentMeta.icon} size={20} color={currentMeta.color} />
          </View>
          <View style={styles.triggerTextCol}>
            <Text style={styles.triggerText} numberOfLines={1}>
              {value}
            </Text>
            <Text
              style={[styles.facultyBadgeText, { color: currentMeta.color }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currentMeta.shortName} • Universitas Buddhi Dharma
            </Text>
          </View>
        </View>

        <View style={styles.chevronBox}>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Pilih Fakultas</Text>
                <Text style={styles.modalSubtitle}>Pilih salah satu dari 4 fakultas resmi UBD</Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={8}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.optionsList}>
              {FAKULTAS_OPTIONS.map((fakultas) => {
                const meta = FACULTY_META[fakultas];
                const isSelected = fakultas === value;
                return (
                  <Pressable
                    key={fakultas}
                    onPress={() => handleSelect(fakultas)}
                    style={({ pressed }) => [
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                      pressed && styles.optionItemPressed,
                    ]}
                  >
                    <View style={[styles.optionIconBox, { backgroundColor: meta.bgLight }]}>
                      <Ionicons name={meta.icon} size={22} color={meta.color} />
                    </View>

                    <View style={styles.optionTextCol}>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {fakultas}
                      </Text>
                      <Text style={[styles.optionShortBadge, { color: meta.color }]}>
                        {meta.shortName}
                      </Text>
                    </View>

                    <View style={styles.optionCheckSlot}>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={colors.primary}
                        />
                      ) : (
                        <View style={styles.emptyRadioCircle} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 56,
  },
  triggerBoxPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  triggerBoxDisabled: {
    opacity: 0.6,
    backgroundColor: colors.surfaceSubtle,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  facultyIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTextCol: {
    flex: 1,
    gap: 2,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  facultyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevronBox: {
    paddingLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    boxShadow: shadows.elevated,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  optionsList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  optionItemSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  optionItemPressed: {
    opacity: 0.8,
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
    gap: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '800',
    color: colors.primary,
  },
  optionShortBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionCheckSlot: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
