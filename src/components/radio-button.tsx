import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface RadioButtonProps {
  selected: boolean;
  onPress?: () => void;
  label?: string;
  size?: number;
  disabled?: boolean;
}

export function RadioButton({
  selected,
  onPress,
  label,
  size = 22,
  disabled = false,
}: RadioButtonProps) {
  const innerSize = Math.round(size * 0.54);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      hitSlop={6}
    >
      <View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: radius.full,
            borderColor: selected ? colors.primary : colors.radioInactive,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.innerDot,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: radius.full,
                backgroundColor: colors.radioActive,
              },
            ]}
          />
        )}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.75,
  },
  outerCircle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  innerDot: {
    // Solid pekat sesuai referensi mockup
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
