import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '@/theme';

export function CampusBanner() {
  return (
    <View style={styles.containerWrapper}>
      <LinearGradient
        colors={colors.gradients.heroLogin}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Top Institutional Header */}
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <View style={styles.categoryDot} />
            <Text style={styles.categoryText}>PORTAL AKADEMIK RESMI</Text>
          </View>

          <View style={styles.termChip}>
            <Ionicons name="calendar-outline" size={12} color="#93C5FD" />
            <Text style={styles.termChipText}>TA 2024/2025</Text>
          </View>
        </View>

        {/* Center Presentation */}
        <View style={styles.bodyContent}>
          <View style={styles.iconEmblem}>
            <Ionicons name="school" size={26} color="#FFFFFF" />
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
            <Ionicons name="location-outline" size={13} color="#94A3B8" />
            <Text style={styles.metaText} numberOfLines={1}>
              Karawaci, Tangerang
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="server-outline" size={13} color="#6EE7B7" />
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
    boxShadow: shadows.card,
  },
  gradientCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E0F2FE',
    letterSpacing: 0.8,
  },
  termChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  termChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BFDBFE',
    letterSpacing: 0.2,
  },
  bodyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconEmblem: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  campusName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  campusMotto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#CBD5E1',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  metaStatusText: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '600',
  },
});
