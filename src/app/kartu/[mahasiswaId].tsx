import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { MahasiswaService } from '../../services/mahasiswa-service';
import { PDFService } from '../../services/pdf-service';
import { Mahasiswa } from '../../types/mahasiswa';
import { LotusRing } from '@/components/lotus-ring';
import { PhotoAvatar } from '@/components/photo-avatar';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export default function KartuMahasiswaDetailScreen() {
  const router = useRouter();
  const { mahasiswaId } = useLocalSearchParams<{ mahasiswaId: string }>();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchDetail() {
      try {
        if (!mahasiswaId) return;
        const data = await MahasiswaService.getById(mahasiswaId);
        if (!ignore) {
          setMahasiswa(data);
        }
      } catch (err: any) {
        console.error('Gagal mengambil data mahasiswa:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [mahasiswaId]);

  const handleShare = async () => {
    if (!mahasiswa) return;
    try {
      await PDFService.shareStudentCard(mahasiswa);
    } catch (err: any) {
      console.error('Error saat share kartu:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!mahasiswa) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.textMuted} />
        <Text style={styles.emptyText}>Data Mahasiswa tidak ditemukan</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Digital Student Card Container */}
        <View style={styles.cardContainer}>
          {/* Card Header Gradient UBD Crimson */}
          <LinearGradient
            colors={colors.gradients.heroLogin}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            {/* Watermark Motif Teratai */}
            <View style={styles.watermarkLayer}>
              <LotusRing size={160} color="#FFFFFF" opacity={0.15} strokeWidth={1.2} />
            </View>

            <View style={styles.universityHeader}>
              <View style={styles.logoBadge}>
                <Ionicons name="school" size={22} color={colors.highlight} />
              </View>
              <View style={styles.universityTextContainer}>
                <Text style={styles.universityName}>UNIVERSITAS BUDDHI DHARMA</Text>
                <Text style={styles.cardTypeTitle}>KARTU TANDA MAHASISWA DIGITAL</Text>
              </View>
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarRow}>
              <PhotoAvatar
                uri={mahasiswa.fotoUrl || (mahasiswa as any).foto_url}
                size={68}
                shape="circle"
                name={mahasiswa.nama}
                style={styles.avatarGradient}
              />
              <View style={styles.primaryInfo}>
                <Text style={styles.studentName} numberOfLines={2}>
                  {mahasiswa.nama}
                </Text>
                <Text style={styles.studentNim}>NIM: {mahasiswa.nim}</Text>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>{mahasiswa.status || 'Aktif'}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Gold Accent Divider Strip */}
          <View style={styles.goldDividerStrip} />

          {/* Card Body Information */}
          <View style={styles.cardBody}>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fakultas</Text>
                <Text style={styles.infoValue}>{mahasiswa.fakultas}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Program Studi</Text>
                <Text style={styles.infoValue}>{mahasiswa.prodi || 'Reguler'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                <Text style={styles.infoValue}>
                  {mahasiswa.jenisKelamin === 'PRIA' ? 'Laki-laki' : 'Perempuan'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tahun Masuk</Text>
                <Text style={styles.infoValue}>{mahasiswa.tahunMasuk || '2021'}</Text>
              </View>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={mahasiswa.nim}
                  size={110}
                  color={colors.textPrimary}
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.qrCaption}>Scan QR Code untuk verifikasi NIM</Text>
              <Text style={styles.qrNim}>{mahasiswa.nim}</Text>
            </View>

            {/* Official Footer Note */}
            <View style={styles.cardFooter}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
              <Text style={styles.cardFooterText}>
                Dokumen Resmi Universitas Buddhi Dharma • Tangerang
              </Text>
            </View>
          </View>
        </View>

        {/* Tombol Bagikan Kartu Mahasiswa */}
        <TouchableOpacity
          style={styles.shareCardBtn}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={18} color={colors.textOnPrimary} />
          <Text style={styles.shareCardBtnText}>Bagikan Kartu Mahasiswa</Text>
        </TouchableOpacity>

        {/* Security & Verification Card Info */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
          <Text style={styles.noticeText}>
            Kartu Mahasiswa Digital ini sah dan berlaku sebagai tanda pengenal identitas akademik di seluruh lingkungan kampus UBD.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.elevated,
  },
  cardHeader: {
    padding: spacing.lg + 2,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkLayer: {
    position: 'absolute',
    right: -25,
    top: -15,
    zIndex: 0,
  },
  universityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: spacing.sm + 4,
    zIndex: 1,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.4)',
  },
  universityTextContainer: {
    flex: 1,
  },
  universityName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardTypeTitle: {
    color: colors.onPrimaryMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 1,
  },
  avatarGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: colors.highlight,
    boxShadow: shadows.glow,
  },
  primaryInfo: {
    flex: 1,
    gap: 3,
  },
  studentName: {
    fontFamily: fonts.displayBold,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  studentNim: {
    color: colors.onPrimaryMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.successBorder,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  goldDividerStrip: {
    height: 4,
    backgroundColor: colors.highlight,
    width: '100%',
  },
  cardBody: {
    padding: spacing.lg + 2,
    gap: spacing.lg,
    backgroundColor: colors.surface,
  },
  infoGrid: {
    gap: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  qrCaption: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  qrNim: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cardFooterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    maxWidth: 380,
    width: '100%',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  shareCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 380,
    boxShadow: shadows.glow,
  },
  shareCardBtnText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
