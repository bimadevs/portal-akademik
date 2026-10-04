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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuditService } from '../../services/audit-service';
import { AuditLog } from '../../types/mahasiswa';
import { SearchBar } from '../../components/search-bar';
import { UBD_COLORS } from '../../constants/theme';

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
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    };
  }
  if (norm.includes('KRS') || norm.includes('DISPENSASI')) {
    return {
      label: 'Dispensasi KRS',
      icon: 'shield-checkmark-outline' as const,
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
    };
  }
  if (norm.includes('MAHASISWA') || norm.includes('STATUS')) {
    return {
      label: 'Status Mhs',
      icon: 'person-outline' as const,
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
    };
  }
  if (norm.includes('RESTORE')) {
    return {
      label: 'Restore DB',
      icon: 'refresh-circle-outline' as const,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
    };
  }
  if (norm.includes('DELETE')) {
    return {
      label: 'Hapus Data',
      icon: 'trash-outline' as const,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
    };
  }
  return {
    label: action,
    icon: 'time-outline' as const,
    color: '#4B5563',
    bgColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  };
}

export default function AuditLogScreen() {
  const router = useRouter();
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
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Jejak Audit Administratif</Text>
          <Text style={styles.headerSub}>Rekam jejak mutasi & keamanan data sistem</Text>
        </View>
      </View>

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
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Audit Logs List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Tidak Ada Rekam Jejak</Text>
              <Text style={styles.emptySub}>
                Belum ada aktivitas administratif yang sesuai dengan filter ini.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = getActionMeta(item.action);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.actionBadge, { backgroundColor: meta.bgColor, borderColor: meta.borderColor }]}>
                    <Ionicons name={meta.icon} size={14} color={meta.color} />
                    <Text style={[styles.actionBadgeText, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                  <Text style={styles.timestampText}>
                    {formatIndonesianTimestamp(item.timestamp)}
                  </Text>
                </View>

                <Text style={styles.detailsText}>{item.details || 'Aktivitas mutasi data tercatat'}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.entityTag}>
                    <Text style={styles.entityTagText}>
                      {item.entity} {item.entityId ? `#${item.entityId}` : ''}
                    </Text>
                  </View>
                  <View style={styles.actorRow}>
                    <Ionicons name="person-circle-outline" size={14} color="#64748B" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: UBD_COLORS.PRIMARY,
    borderColor: UBD_COLORS.PRIMARY,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  detailsText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  entityTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entityTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actorText: {
    fontSize: 11,
    color: '#64748B',
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
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
