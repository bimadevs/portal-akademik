import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { UBD_COLORS } from '@/constants/theme';

interface PhotoAvatarProps {
  uri?: string | null;
  size?: number;
  name?: string;
  editable?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  shape?: 'circle' | 'rounded';
}

export function PhotoAvatar({
  uri,
  size = 50,
  name,
  editable = false,
  onPress,
  style,
  shape = 'circle',
}: PhotoAvatarProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const borderRadius = shape === 'circle' ? size / 2 : Math.round(size * 0.22);
  const badgeSize = Math.max(22, Math.round(size * 0.3));

  const getInitials = (fullName?: string) => {
    if (!fullName) return null;
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const cleanUri = uri?.trim();
  const hasValidPhoto = Boolean(cleanUri && failedUri !== cleanUri);

  const content = (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      {hasValidPhoto ? (
        <Image
          source={{ uri: cleanUri! }}
          style={{ width: size, height: size, borderRadius }}
          contentFit="cover"
          transition={200}
          onError={() => setFailedUri(cleanUri || null)}
        />
      ) : initials ? (
        <View
          style={[
            styles.fallbackContainer,
            { width: size, height: size, borderRadius, backgroundColor: '#2563EB' },
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              { fontSize: Math.max(12, Math.round(size * 0.38)) },
            ]}
          >
            {initials}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            { width: size, height: size, borderRadius, backgroundColor: '#E2E8F0' },
          ]}
        >
          <Ionicons
            name="person"
            size={Math.round(size * 0.5)}
            color={UBD_COLORS.PRIMARY}
          />
        </View>
      )}

      {editable && (
        <View
          style={[
            styles.editBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <Ionicons name="camera" size={Math.round(badgeSize * 0.6)} color="#FFFFFF" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={editable ? 'Ubah foto profil' : 'Foto profil'}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: UBD_COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
});
