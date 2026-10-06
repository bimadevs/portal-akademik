import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '@/theme';

interface UBDHeaderProps {
  showLogout?: boolean;
  onLogout?: () => void;
  showSettings?: boolean;
  onSettings?: () => void;
  subtitle?: string;
  variant?: 'default' | 'elevated';
}

export function UBDHeader({
  showLogout = false,
  onLogout,
  showSettings = false,
  onSettings,
  subtitle,
  variant = 'default',
}: UBDHeaderProps) {
  return (
    <View style={[styles.container, variant === 'elevated' && styles.containerElevated]}>
      <View style={styles.leftSection}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/ubd-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Universitas Buddhi Dharma - Kreativitas Membangkitkan Inovasi"
          />
        </View>
        {subtitle ? (
          <Text style={styles.subtitleText} numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSection}>
        {/* Admin Tag */}
        <View style={styles.adminTag}>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={11} color={colors.primary} />
          </View>
          <Text style={styles.adminText}>Admin</Text>
        </View>

        {/* Settings Action */}
        {showSettings && onSettings && (
          <Pressable
            onPress={onSettings}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Pengaturan Aplikasi"
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={17} color={colors.textSecondary} />
          </Pressable>
        )}

        {/* Logout Action */}
        {showLogout && onLogout && (
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Logout Administrator"
            hitSlop={8}
          >
            <Ionicons name="log-out-outline" size={17} color={colors.danger} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerElevated: {
    boxShadow: shadows.subtle,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    maxWidth: 185,
  },
  subtitleText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: -2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  adminAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
});
