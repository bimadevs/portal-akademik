import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuditService } from '../../services/audit-service';
import { AuditLog } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

const FILTER_CHIPS = ['Semua', 'Nilai', 'KRS', 'Mahasiswa', 'Database'];

function formatIndonesianTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch {
    return isoString;
  }
}

function getActionMeta(action: string) {
  const norm = action.toUpperCase();
  if (norm.includes('NILAI')) {
    return {
      label: 'Nilai',
      icon: 'ribbon-outline' as const,
      color: colors.primary,
      bgColor: colors.primaryLight,
      borderColor: colors.primaryBorder,
    };
  }
  if (norm.includes('KRS') || norm.includes('DISPENSASI')) {
    return {
      label: 'Dispensasi KRS',
      icon: 'shield-checkmark-outline' as const,
      color: colors.warning,
      bgColor: colors.warningLight,
      borderColor: colors.warningBorder,
    };
  }
  if (norm.includes('MAHASISWA') || norm.includes('STATUS')) {
    return {
      label: 'Status Mhs',
      icon: 'person-outline' as const,
      color: colors.success,
      bgColor: colors.successLight,
      borderColor: colors.successBorder,
    };
  }
  if (norm.includes('RESTORE')) {
    return {
      label: 'Restore DB',
      icon: 'refresh-circle-outline' as const,
      color: colors.accent,
      bgColor: colors.accentLight,
      borderColor: colors.accentBorder,
    };
  }
  if (norm.includes('DELETE')) {
    return {
      label: 'Hapus Data',
      icon: 'trash-outline' as const,
      color: colors.danger,
      bgColor: colors.dangerLight,
      borderColor: colors.dangerBorder,
    };
  }
  return {
    label: action,
    icon: 'time-outline' as const,
    color: colors.textSecondary,
    bgColor: colors.surfaceSubtle,
    borderColor: colors.border,
  };
}

export default function AuditLogScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await AuditService.getAuditLogs(activeChip, search, 200);
        if (!ignore) {
          setLogs(data);
        }
      } catch (err: any) {
        if (!ignore) {
          Alert.alert('Error', err.message || 'Gagal memuat rekam jejak audit');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchLogs();
    return () => {
      ignore = true;
    };
  }, [activeChip, search]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari entitas, aksi, rincian, atau admin..."
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        {FILTER_CHIPS.map((chip) => {
          const isSelected = activeChip === chip;
          return (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => setActiveChip(chip)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={56} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Catatan Audit</Text>
              <Text style={styles.emptySub}>
                Aktivitas sistem yang tercatat akan ditampilkan di halaman ini.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = getActionMeta(item.action);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.actionBadge,
                      {
                        backgroundColor: meta.bgColor,
                        borderColor: meta.borderColor,
                      },
                    ]}
                  >
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                    <Text style={[styles.actionBadgeText, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>

                  <Text style={styles.timestampText}>
                    {formatIndonesianTimestamp(item.timestamp)}
                  </Text>
                </View>

                <Text style={styles.detailsText}>{item.details}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.entityTag}>
                    <Text style={styles.entityTagText}>
                      Entitas: {item.entity} (ID: {item.entityId})
                    </Text>
                  </View>

                  <View style={styles.actorRow}>
                    <Ionicons name="person-circle-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.actorText}>Admin: {item.actor}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timestampText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailsText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.sm + 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  entityTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xxs,
  },
  entityTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actorText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
