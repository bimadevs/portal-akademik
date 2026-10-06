import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LotusRing } from '@/components/lotus-ring';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export function CampusBanner() {
  return (
    <View style={styles.containerWrapper}>
      <LinearGradient
        colors={colors.gradients.heroLogin}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Lotus Motif Watermark in Background */}
        <View style={styles.watermarkLayer}>
          <LotusRing
            size={180}
            color="#FFFFFF"
            opacity={0.14}
            strokeWidth={1.2}
          />
        </View>

        {/* Top Institutional Header */}
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <View style={styles.categoryDot} />
            <Text style={styles.categoryText}>PORTAL AKADEMIK RESMI</Text>
          </View>

          <View style={styles.termChip}>
            <View style={styles.goldDot} />
            <Text style={styles.termChipText}>TA 2025/2026</Text>
          </View>
        </View>

        {/* Center Presentation */}
        <View style={styles.bodyContent}>
          <View style={styles.iconEmblem}>
            <Ionicons name="school" size={26} color={colors.highlight} />
          </View>

          <View style={styles.textColumn}>
            <Text style={styles.campusName} numberOfLines={1}>
              Universitas Buddhi Dharma
            </Text>
            <Text style={styles.campusMotto} numberOfLines={1}>
              “Kreativitas Membangkitkan Inovasi”
            </Text>
          </View>
        </View>

        {/* Bottom Metadata Footer */}
        <View style={styles.footerRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.onPrimaryMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              Karawaci, Tangerang
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="server-outline" size={13} color="#A7F3D0" />
            <Text style={styles.metaStatusText} numberOfLines={1}>
              Basis Data Offline Mandiri
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: shadows.glow,
  },
  gradientCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.25)',
    gap: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkLayer: {
    position: 'absolute',
    right: -30,
    top: -20,
    zIndex: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.highlight,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  termChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.35)',
  },
  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.highlight,
  },
  termChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.highlight,
    letterSpacing: 0.4,
  },
  bodyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  iconEmblem: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  campusName: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  campusMotto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.onPrimaryMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: colors.onPrimaryMuted,
    fontWeight: '500',
  },
  metaStatusText: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
  },
});
