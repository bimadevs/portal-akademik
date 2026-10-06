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

const FACULTY_BADGE_COLORS: Record<Fakultas, { text: string; bg: string }> = {
  'Sains dan Teknologi': {
    text: '#0284C7',
    bg: '#E0F2FE',
  },
  'Bisnis': {
    text: '#0D9488',
    bg: '#CCFBF1',
  },
  'Ilmu Komunikasi dan Desain': {
    text: '#7C3AED',
    bg: '#EDE9FE',
  },
  'Sosial dan Humaniora': {
    text: '#C2410C',
    bg: '#FFEDD5',
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
    const facultyStyle = FACULTY_BADGE_COLORS[item.fakultas] ?? {
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
            size={18}
          />
        </View>

        {/* Foto / Avatar */}
        <PhotoAvatar
          uri={item.fotoUrl || (item as any).foto_url}
          size={42}
          name={item.nama}
          shape="rounded"
        />

        {/* Info Mahasiswa Format Resmi: [Nama Mahasiswa] [NIM] */}
        <View style={styles.studentInfoCol}>
          <View style={styles.primaryRow}>
            <Text
              style={[styles.studentFormatText, isSelected && styles.studentFormatTextSelected]}
              numberOfLines={1}
            >
              {item.nama} <Text style={styles.nimHighlight}>{item.nim}</Text>
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.facultyBadge, { backgroundColor: facultyStyle.bg }]}>
              <Text style={[styles.facultyBadgeText, { color: facultyStyle.text }]} numberOfLines={1}>
                {item.fakultas}
              </Text>
            </View>

            <Text style={styles.genderTag}>
              {item.jenisKelamin === 'PRIA' ? 'L' : 'P'}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={isSelected ? colors.primary : colors.textMuted}
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Resmi UBD */}
      <UBDHeader subtitle="Direktori & Rekapitulasi Data" variant="elevated" />

      {/* Search & Filter Header Container */}
      <View style={styles.searchFilterContainer}>
        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search-outline" size={17} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari nama atau NIM..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCorrect={false}
            accessibilityLabel="Pencarian Mahasiswa"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Horizontal Faculty Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipList}
        >
          {FILTER_FACULTIES.map((fac) => {
            const isFilterActive = selectedFaculty === fac;
            const count =
              fac === 'Semua'
                ? mahasiswaList.length
                : mahasiswaList.filter((m) => m.fakultas === fac).length;

            return (
              <Pressable
                key={fac}
                onPress={() => setSelectedFaculty(fac)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isFilterActive && styles.filterChipActive,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${fac}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isFilterActive && styles.filterChipTextActive,
                  ]}
                >
                  {fac}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    isFilterActive && styles.countBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      isFilterActive && styles.countBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List Area */}
      {isLoading ? (
        <View style={styles.loadingCenter}>
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
          ListHeaderComponent={
            <View style={styles.listHeaderRow}>
              <Text style={styles.listCountSummary}>
                Menampilkan <Text style={styles.boldText}>{filteredList.length}</Text> dari{' '}
                {mahasiswaList.length} mahasiswa
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Data Tidak Ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Tidak ada mahasiswa yang cocok dengan pencarian.'
                  : 'Belum ada data mahasiswa terdaftar.'}
              </Text>
              {searchQuery ? (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  style={styles.resetSearchBtn}
                >
                  <Text style={styles.resetSearchText}>Hapus Filter Pencarian</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => router.push('/(tabs)/mahasiswa')}
                  style={styles.addStudentBtn}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addStudentBtnText}>Tambah Mahasiswa Baru</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      {/* Modal Interaktif Saat Baris Mahasiswa Disentuh */}
      <MahasiswaClickModal
        visible={showClickModal}
        mahasiswa={activeMahasiswa}
        onClose={handleCloseClickModal}
        onRequestDelete={handleRequestDelete}
      />

      {/* Modal Konfirmasi Hapus Data Mahasiswa */}
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
    backgroundColor: colors.background,
  },
  searchFilterContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    height: '100%',
  },
  filterChipList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  countBadgeActive: {
    backgroundColor: '#BFDBFE',
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  countBadgeTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 24,
    gap: spacing.sm,
  },
  listHeaderRow: {
    marginBottom: spacing.xs,
  },
  listCountSummary: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.subtle,
    gap: spacing.sm,
  },
  studentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FAFCFF',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  radioSlot: {
    paddingRight: 2,
  },
  studentInfoCol: {
    flex: 1,
    gap: 4,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentFormatText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentFormatTextSelected: {
    color: colors.primary,
  },
  nimHighlight: {
    fontWeight: '500',
    color: colors.textSecondary,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  facultyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  facultyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  genderTag: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  loadingCenter: {
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  resetSearchBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetSearchText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  addStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  addStudentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
