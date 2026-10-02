import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DeleteConfirmationModal,
  MahasiswaClickModal,
} from '@/components/interactive-modal';
import { RadioButton } from '@/components/radio-button';
import { UBDHeader } from '@/components/ubd-header';
import { PhotoAvatar } from '@/components/photo-avatar';
import { StorageService } from '@/services/storage';
import { Fakultas, Mahasiswa } from '@/types/mahasiswa';
import { colors, radius, shadows, spacing } from '@/theme';

const FILTER_FACULTIES: ('Semua' | Fakultas)[] = [
  'Semua',
  'Sains dan Teknologi',
  'Bisnis',
  'Ilmu Komunikasi dan Desain',
  'Sosial dan Humaniora',
];

const FACULTY_COLORS: Record<Fakultas, { gradient: readonly [string, string]; text: string; bg: string }> = {
  'Sains dan Teknologi': {
    gradient: ['#0284C7', '#0EA5E9'],
    text: '#0369A1',
    bg: '#E0F2FE',
  },
  'Bisnis': {
    gradient: ['#0D9488', '#14B8A6'],
    text: '#0F766E',
    bg: '#CCFBF1',
  },
  'Ilmu Komunikasi dan Desain': {
    gradient: ['#7C3AED', '#8B5CF6'],
    text: '#6D28D9',
    bg: '#EDE9FE',
  },
  'Sosial dan Humaniora': {
    gradient: ['#D97706', '#F59E0B'],
    text: '#B45309',
    bg: '#FEF3C7',
  },
};

export default function ReportScreen() {
  const router = useRouter();

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedNim, setSelectedNim] = useState<string | null>(null);
  const [activeMahasiswa, setActiveMahasiswa] = useState<Mahasiswa | null>(null);
  const [showClickModal, setShowClickModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<'Semua' | Fakultas>('Semua');

  // Ambil data terbaru setiap kali tab Report menjadi fokus
  const loadData = useCallback(async () => {
    try {
      const list = await StorageService.getMahasiswaList();
      setMahasiswaList(list);
    } catch (e) {
      console.error('Gagal memuat list mahasiswa:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Filter & Search Logic
  const filteredList = useMemo(() => {
    return mahasiswaList.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        item.nim.toLowerCase().includes(query);

      const matchesFaculty =
        selectedFaculty === 'Semua' || item.fakultas === selectedFaculty;

      return matchesSearch && matchesFaculty;
    });
  }, [mahasiswaList, searchQuery, selectedFaculty]);

  // Interaktivitas saat pengguna menyentuh baris mahasiswa
  const handleRowClick = (item: Mahasiswa) => {
    setSelectedNim(item.nim);
    setActiveMahasiswa(item);
    setShowClickModal(true);
  };

  const handleCloseClickModal = () => {
    setShowClickModal(false);
  };

  const handleRequestDelete = (item: Mahasiswa) => {
    setShowClickModal(false);
    setActiveMahasiswa(item);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!activeMahasiswa) return;

    setIsDeleting(true);
    try {
      const success = await StorageService.deleteMahasiswa(activeMahasiswa.nim);
      if (success) {
        setMahasiswaList((prev) =>
          prev.filter((m) => m.nim !== activeMahasiswa.nim)
        );
        if (selectedNim === activeMahasiswa.nim) {
          setSelectedNim(null);
        }
      }
    } catch (e) {
      console.error('Error saat menghapus data mahasiswa:', e);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setActiveMahasiswa(null);
    }
  };

  const renderItem = ({ item }: { item: Mahasiswa }) => {
    const isSelected = selectedNim === item.nim;
    const facultyStyle = FACULTY_COLORS[item.fakultas] ?? {
      gradient: ['#2563EB', '#1D4ED8'],
      text: colors.primary,
      bg: colors.primaryLight,
    };

    return (
      <Pressable
        onPress={() => handleRowClick(item)}
        style={({ pressed }) => [
          styles.studentCard,
          isSelected && styles.studentCardSelected,
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Pilih mahasiswa ${item.nama} ${item.nim}`}
      >
        {/* Radio button indikator seleksi aktif (•) sesuai kriteria FR-12 */}
        <View style={styles.radioSlot}>
          <RadioButton
            selected={isSelected}
            onPress={() => handleRowClick(item)}
            size={22}
          />
        </View>

        {/* Squircle Avatar with Photo or Initial */}
        <PhotoAvatar
          uri={item.fotoUrl || (item as any).foto_url}
          size={44}
          shape="rounded"
          name={item.nama}
        />

        {/* Content Column: Nama Mahasiswa & NIM */}
        <View style={styles.contentCol}>
          <View style={styles.nameHeaderRow}>
            <Text
              style={[
                styles.studentName,
                isSelected && styles.studentNameSelected,
              ]}
              numberOfLines={1}
            >
              {item.nama}
            </Text>
            <View style={styles.genderTag}>
              <Text style={styles.genderTagText}>
                {item.jenisKelamin === 'PRIA' ? '👨 PRIA' : '👩 WANITA'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.nimBadge}>
              <Ionicons name="card-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.nimText}>{item.nim}</Text>
            </View>

            <View style={[styles.facultyChip, { backgroundColor: facultyStyle.bg }]}>
              <Text
                style={[styles.facultyChipText, { color: facultyStyle.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.fakultas}
              </Text>
            </View>
          </View>
        </View>

        {/* Chevron Indicator */}
        <View style={styles.chevronBox}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isSelected ? colors.primary : colors.textMuted}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Resmi UBD */}
      <UBDHeader subtitle="Pusat Data & Rekapitulasi" variant="elevated" />

      <View style={styles.container}>
        {/* Top Summary Banner */}
        <View style={styles.topSummaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.activePill}>
              <View style={styles.activePillDot} />
              <Text style={styles.activePillText}>DISPLAY DATA MAHASISWA</Text>
            </View>
            <Text style={styles.summaryTitle}>Rekapitulasi Mahasiswa</Text>
            <Text style={styles.summarySubtitle}>
              Sentuh baris data untuk melihat detail dan menghapus data
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{mahasiswaList.length}</Text>
            <Text style={styles.countLabel}>Total Mahasiswa</Text>
          </View>
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari berdasarkan nama atau NIM..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Faculty Filter Horizontal Chips */}
        <View style={styles.filterScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            {FILTER_FACULTIES.map((faculty) => {
              const isActive = selectedFaculty === faculty;
              return (
                <Pressable
                  key={faculty}
                  onPress={() => setSelectedFaculty(faculty)}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {faculty}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* List Mahasiswa Section */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat data mahasiswa...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.nim}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="search-outline" size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery
                    ? 'Mahasiswa Tidak Ditemukan'
                    : 'Belum Ada Data Mahasiswa'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `Tidak ada hasil untuk pencarian "${searchQuery}". Coba kata kunci lain.`
                    : 'Pangkalan data belum memuat mahasiswa. Silakan input data baru.'}
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/mahasiswa')}
                  style={styles.emptyAddButton}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyAddButtonText}>+ Tambah Mahasiswa</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </View>

      {/* Modal Dialog: "Yang anda Klik : [Nama] [NIM]" sesuai FR-13 */}
      <MahasiswaClickModal
        visible={showClickModal}
        mahasiswa={activeMahasiswa}
        onClose={handleCloseClickModal}
        onRequestDelete={handleRequestDelete}
      />

      {/* Modal Dialog: Konfirmasi Hapus Data Mahasiswa sesuai FR-14 */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        mahasiswa={activeMahasiswa}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  topSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    boxShadow: shadows.card,
  },
  summaryLeft: {
    flex: 1,
    gap: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  summarySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: spacing.sm,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 46,
    boxShadow: shadows.subtle,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    height: '100%',
  },
  filterScrollWrapper: {
    marginBottom: 2,
  },
  filterChipRow: {
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl + 20,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    boxShadow: shadows.card,
    gap: spacing.sm,
  },
  studentCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#60A5FA',
    boxShadow: shadows.raised,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  radioSlot: {
    marginRight: 2,
  },
  avatarSquircle: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.subtle,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contentCol: {
    flex: 1,
    gap: 4,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  studentNameSelected: {
    color: colors.primary,
  },
  genderTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  genderTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  nimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nimText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  facultyChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    maxWidth: 140,
    flexShrink: 1,
  },
  facultyChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevronBox: {
    paddingLeft: spacing.xs,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
    boxShadow: shadows.glow,
  },
  emptyAddButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

