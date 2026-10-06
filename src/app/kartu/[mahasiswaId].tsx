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
import { UBD_COLORS } from '../../constants/theme';
import { PhotoAvatar } from '@/components/photo-avatar';

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
        <ActivityIndicator size="large" color={UBD_COLORS.PRIMARY} />
      </View>
    );
  }

  if (!mahasiswa) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={56} color="#94A3B8" />
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
          {/* Card Header Gradient */}
          <LinearGradient
            colors={['#2B52BA', '#1E40AF', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            <View style={styles.universityHeader}>
              <View style={styles.logoBadge}>
                <Ionicons name="school" size={24} color="#FFFFFF" />
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
                  color="#1E293B"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.qrCaption}>Scan QR Code untuk verifikasi NIM</Text>
              <Text style={styles.qrNim}>{mahasiswa.nim}</Text>
            </View>

            {/* Official Footer Note */}
            <View style={styles.cardFooter}>
              <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
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
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
          <Text style={styles.shareCardBtnText}>Bagikan Kartu Mahasiswa</Text>
        </TouchableOpacity>

        {/* Security & Verification Card Info */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
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
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    padding: 22,
    paddingBottom: 24,
    gap: 18,
  },
  universityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    paddingBottom: 14,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  universityTextContainer: {
    flex: 1,
  },
  universityName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardTypeTitle: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  primaryInfo: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  studentNim: {
    color: '#DBEAFE',
    fontSize: 13,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: 22,
    gap: 20,
    backgroundColor: '#FFFFFF',
  },
  infoGrid: {
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  qrCaption: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
  qrNim: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardFooterText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    maxWidth: 380,
    width: '100%',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  shareCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: UBD_COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 380,
  },
  shareCardBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
