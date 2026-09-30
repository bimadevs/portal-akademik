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
import { useAuth } from '@/context/auth-context';
import { colors, radius, shadows, spacing } from '@/theme';

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
      'Untuk pembuatan akun administrator baru, silakan menghubungi Bagian Administrasi IT Universitas Buddhi Dharma.',
      [{ text: 'Mengerti', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Atmospheric Campus Hero */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#070F26', '#0F1E47', '#1E3A8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.ambientOrbRight} />
              <View style={styles.ambientOrbLeft} />

              {/* Logo UBD Emblem Card */}
              <View style={styles.logoCardWrapper}>
                <Image
                  source={require('../../assets/images/ubd-logo.png')}
                  style={styles.ubdLogo}
                  resizeMode="contain"
                  accessibilityLabel="Universitas Buddhi Dharma"
                />
              </View>

              {/* Tagline & Identity */}
              <View style={styles.heroTextWrapper}>
                <View style={styles.badgePill}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgePillText}>PORTAL AKADEMIK RESMI</Text>
                </View>
                <Text style={styles.heroTitle}>Sistem Informasi Akademik</Text>
                <Text style={styles.heroMotto}>
                  “Kreativitas Membangkitkan Inovasi”
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Floating Modern Login Card */}
          <View style={styles.floatingCard}>
            {/* Header Form */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Masuk Administrator</Text>
                <Text style={styles.cardSubtitle}>
                  Silakan masukkan kredensial akun Anda
                </Text>
              </View>
              <View style={styles.shieldIconBox}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              </View>
            </View>

            {/* Quick-Fill Demo Helper Chip for Evaluator */}
            <Pressable
              onPress={handleQuickFillDemo}
              style={({ pressed }) => [
                styles.quickFillChip,
                pressed && styles.quickFillChipPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Isi otomatis akun demo"
            >
              <Ionicons name="flash" size={14} color="#2563EB" />
              <Text style={styles.quickFillText}>
                Gunakan Akun Demo:{' '}
                <Text style={styles.quickFillBold}>admin / admin</Text>
              </Text>
            </Pressable>

            {/* Input Field: User */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>User / Username</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'user' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={focusedInput === 'user' ? colors.primary : colors.textSecondary}
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedInput('user')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Ketik user (admin)"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.textInput}
                  accessibilityLabel="Input Username Administrator"
                />
                {username.length > 0 && (
                  <Pressable onPress={() => setUsername('')} hitSlop={6}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Input Field: Password */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                {/* Tautan Sign-up di sisi kanan sesuai spesifikasi */}
                <Pressable
                  onPress={handleSignUpInfo}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Informasi Pendaftaran Akun"
                >
                  <Text style={styles.signUpLinkText}>Sign-up / Bantuan?</Text>
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
                  size={19}
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
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Tombol LOGIN Bergradien Mewah */}
            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.loginButtonWrapper,
                pressed && styles.loginButtonPressed,
                isSubmitting && styles.loginButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tombol Login"
            >
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.loginButtonText}>LOGIN</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Footer Institusi */}
          <View style={styles.footerContainer}>
            <Ionicons name="business-outline" size={14} color={colors.textMuted} />
            <Text style={styles.footerText}>
              Universitas Buddhi Dharma • Kampus Karawaci
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  heroContainer: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: radius['3xl'],
    borderBottomRightRadius: radius['3xl'],
    boxShadow: shadows.cardElevated,
  },
  heroGradient: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + 20,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  ambientOrbRight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3B82F6',
    opacity: 0.22,
    top: -40,
    right: -50,
  },
  ambientOrbLeft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#06B6D4',
    opacity: 0.15,
    bottom: -20,
    left: -40,
  },
  logoCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    boxShadow: shadows.glow,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ubdLogo: {
    width: 220,
    height: 48,
  },
  heroTextWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E0F2FE',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroMotto: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  floatingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -32,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    boxShadow: shadows.elevated,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  shieldIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickFillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickFillChipPressed: {
    opacity: 0.7,
    backgroundColor: '#DBEAFE',
  },
  quickFillText: {
    fontSize: 12,
    color: '#1E40AF',
  },
  quickFillBold: {
    fontWeight: '700',
    color: '#1D4ED8',
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
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
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
  loginButtonWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    boxShadow: shadows.glow,
    marginTop: spacing.xs,
  },
  loginButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textOnPrimary,
    letterSpacing: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

