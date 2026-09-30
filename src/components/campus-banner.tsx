import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { radius, shadows, spacing } from '@/theme';

export function CampusBanner() {
  const pulse = useSharedValue(0.4);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    shimmer.value = withRepeat(withTiming(1, { duration: 3000 }), -1, false);
  }, [pulse, shimmer]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={styles.containerWrapper}>
      <LinearGradient
        colors={['#091326', '#122554', '#1E3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Decorative Atmospheric Glow Circles */}
        <View style={styles.ambientCircleRight} />
        <View style={styles.ambientCircleLeft} />
        <Animated.View style={[styles.ambientGlow, animatedGlowStyle]} />

        {/* Top Badges Row */}
        <View style={styles.topRow}>
          {/* Badge GIF / Live Animated Badge */}
          <View style={styles.gifBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.gifText}>LIVE • GIF</Text>
          </View>

          {/* Academic Term Chip */}
          <View style={styles.termChip}>
            <Ionicons name="sparkles" size={11} color="#38BDF8" />
            <Text style={styles.termChipText}>TA 2024/2025</Text>
          </View>
        </View>

        {/* Center Campus Presentation */}
        <View style={styles.bodyContent}>
          <View style={styles.iconEmblem}>
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              style={styles.iconEmblemGradient}
            >
              <Ionicons name="school" size={26} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <View style={styles.textColumn}>
            <Text style={styles.campusCategory} numberOfLines={1}>PORTAL AKADEMIK TERPADU</Text>
            <Text style={styles.campusName} numberOfLines={1} ellipsizeMode="tail">
              Universitas Buddhi Dharma
            </Text>
            <Text style={styles.campusMotto} numberOfLines={1} ellipsizeMode="tail">
              “Kreativitas Membangkitkan Inovasi”
            </Text>
          </View>
        </View>

        {/* Bottom Location & Status Footer */}
        <View style={styles.footerRow}>
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={12} color="#94A3B8" />
            <Text style={styles.locationText} numberOfLines={1}>Karawaci, Tangerang</Text>
          </View>

          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText} numberOfLines={1}>Sistem Online</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    boxShadow: shadows.cardElevated,
  },
  gradientCard: {
    padding: spacing.lg,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientCircleRight: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#3B82F6',
    opacity: 0.18,
    top: -60,
    right: -40,
  },
  ambientCircleLeft: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#06B6D4',
    opacity: 0.12,
    bottom: -40,
    left: -20,
  },
  ambientGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  gifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38BDF8',
  },
  gifText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  termChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  termChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E0F2FE',
    letterSpacing: 0.3,
  },
  bodyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconEmblem: {
    boxShadow: shadows.glow,
  },
  iconEmblemGradient: {
    width: 54,
    height: 54,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  campusCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.2,
  },
  campusName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  campusMotto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#CBD5E1',
    fontWeight: '400',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6EE7B7',
  },
});
