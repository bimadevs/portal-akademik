import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LotusRing } from '@/components/lotus-ring';
import { useAuth } from '@/context/auth-context';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'user' | 'pass' | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Harap isi User dan Password!');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Autentikasi Gagal', result.error ?? 'User atau Password salah!');
      }
    } catch {
      Alert.alert('Error', 'Terjadi gangguan saat mencoba login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFillDemo = () => {
    setUsername('admin');
    setPassword('admin');
  };

  const handleSignUpInfo = () => {
    Alert.alert(
      'Pendaftaran Akun Administrator',
      'Untuk registrasi akun administrator baru atau reset kredensial, silakan hubungi Biro Administrasi Akademik & IT Universitas Buddhi Dharma.',
      [{ text: 'Mengerti', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Institutional Academic Hero */}
          <LinearGradient
            colors={colors.gradients.heroLogin}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          >
            <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
              <View style={styles.heroContent}>
                {/* Lotus Motif Watermark behind Logo */}
                <View style={styles.lotusContainer}>
                  <LotusRing
                    size={240}
                    color="#FFFFFF"
                    opacity={0.16}
                    strokeWidth={1.3}
                    showCenterGlow
                  />
                </View>

                {/* Circular Emblem Plate with Gold Ring */}
                <View style={styles.emblemPlate}>
                  <Image
                    source={require('../../assets/images/ubd-logo.webp')}
                    style={styles.logoEmblem}
                    resizeMode="contain"
                    accessibilityLabel="Logo Resmi Universitas Buddhi Dharma"
                  />
                </View>

                {/* Institutional Brand Identity */}
                <View style={styles.heroTextWrapper}>
                  <Text style={styles.heroPortalTitle}>Portal Akademik</Text>
                  <Text style={styles.heroInstitution}>UNIVERSITAS BUDDHI DHARMA</Text>
                  <Text style={styles.heroMotto}>
                    “Kreativitas Membangkitkan Inovasi”
                  </Text>
                </View>

                {/* Subtle Gold Academic Year Chip */}
                <View style={styles.academicYearChip}>
                  <View style={styles.goldDot} />
                  <Text style={styles.academicYearText}>TAHUN AKADEMIK 2025/2026</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* Overlapping Surface Form Container */}
          <View style={styles.formSurface}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Masuk Administrator</Text>
              <Text style={styles.cardSubtitle}>
                Silakan masukkan kredensial akun administrator Anda untuk melanjutkan
              </Text>
            </View>

            {/* Input: Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Nama Pengguna / ID Admin</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'user' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedInput === 'user' ? colors.primary : colors.textSecondary}
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedInput('user')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Ketik username (admin)"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                  accessibilityLabel="Input Username Administrator"
                />
                {username.length > 0 && (
                  <Pressable onPress={() => setUsername('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={17} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Kata Sandi</Text>
                <Pressable
                  onPress={handleSignUpInfo}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Informasi Pendaftaran Akun"
                >
                  <Text style={styles.signUpLinkText}>Bantuan Masuk?</Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'pass' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedInput === 'pass' ? colors.primary : colors.textSecondary}
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('pass')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Ketik password (admin)"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                  accessibilityLabel="Input Password Administrator"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.eyeIconBtn}
                  accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Primary Action Button (Solid UBD Crimson) */}
            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                isSubmitting && styles.loginButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tombol Masuk ke Portal Akademik"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.loginButtonText}>MASUK KE PORTAL</Text>
                  <Ionicons name="arrow-forward" size={17} color={colors.textOnPrimary} />
                </View>
              )}
            </Pressable>

            {/* Demo Credential Card */}
            <Pressable
              onPress={handleQuickFillDemo}
              style={({ pressed }) => [
                styles.demoAccountCard,
                pressed && styles.demoAccountCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Isi otomatis akun demo administrator"
            >
              <View style={styles.demoIconBox}>
                <Ionicons name="key-outline" size={16} color={colors.accent} />
              </View>
              <View style={styles.demoTextBox}>
                <Text style={styles.demoTitle}>Mode Evaluasi / Penguji</Text>
                <Text style={styles.demoSubtitle}>
                  Sentuh untuk isi otomatis:{' '}
                  <Text style={styles.demoCode}>admin / admin</Text>
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </Pressable>

            {/* Institutional Subtext Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerVersion}>v3.2.0 • 100% Offline-First Relasional</Text>
              <Text style={styles.footerCopyright}>
                Universitas Buddhi Dharma • Karawaci, Tangerang
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroBackground: {
    paddingBottom: spacing.xl + 18,
    position: 'relative',
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingHorizontal: spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: spacing.md,
    gap: spacing.sm,
    position: 'relative',
  },
  lotusContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  emblemPlate: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.highlight,
    boxShadow: shadows.glow,
    zIndex: 2,
    marginBottom: 4,
  },
  logoEmblem: {
    width: 64,
    height: 64,
  },
  heroTextWrapper: {
    alignItems: 'center',
    gap: 3,
    zIndex: 2,
  },
  heroPortalTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroInstitution: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onPrimaryMuted,
    letterSpacing: 1.5,
  },
  heroMotto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.primaryBorder,
    marginTop: 2,
  },
  academicYearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.35)',
    marginTop: 4,
    zIndex: 2,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.highlight,
  },
  academicYearText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.highlight,
    letterSpacing: 0.8,
  },
  formSurface: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    marginTop: -20,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    boxShadow: shadows.elevated,
    gap: spacing.lg,
  },
  cardHeader: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  signUpLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    boxShadow: shadows.subtle,
  },
  inputLeadingIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeIconBtn: {
    padding: spacing.xs,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.glow,
    marginTop: spacing.xs,
  },
  loginButtonPressed: {
    backgroundColor: colors.primaryHover,
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textOnPrimary,
    letterSpacing: 0.8,
  },
  demoAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    gap: spacing.sm,
  },
  demoAccountCardPressed: {
    opacity: 0.85,
  },
  demoIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  demoTextBox: {
    flex: 1,
    gap: 2,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
  },
  demoSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  demoCode: {
    fontWeight: '700',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerContainer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.xs,
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  footerCopyright: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
