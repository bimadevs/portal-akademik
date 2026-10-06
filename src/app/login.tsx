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
      'Untuk registrasi akun administrator baru atau reset kredensial, silakan hubungi Biro Administrasi Akademik & IT Universitas Buddhi Dharma.',
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
          {/* Institutional Academic Header */}
          <View style={styles.brandHero}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/ubd-logo.png')}
                style={styles.ubdLogo}
                resizeMode="contain"
                accessibilityLabel="Universitas Buddhi Dharma"
              />
            </View>

            <View style={styles.heroTextContainer}>
              <Text style={styles.portalCategory}>PORTAL AKADEMIK TERPADU</Text>
              <Text style={styles.institutionName}>Universitas Buddhi Dharma</Text>
              <Text style={styles.institutionMotto}>
                “Kreativitas Membangkitkan Inovasi”
              </Text>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Masuk Administrator</Text>
              <Text style={styles.cardSubtitle}>
                Silakan masukkan kredensial akun administrator Anda
              </Text>
            </View>

            {/* Input: Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Username / ID Admin</Text>
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

            {/* Primary Action Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                isSubmitting && styles.loginButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tombol Login"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.loginButtonText}>MASUK KE PORTAL</Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
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
                <Ionicons name="key-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.demoTextBox}>
                <Text style={styles.demoTitle}>Mode Evaluasi / Penguji</Text>
                <Text style={styles.demoSubtitle}>
                  Sentuh untuk mengisi otomatis:{' '}
                  <Text style={styles.demoCode}>admin / admin</Text>
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Institutional Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerInstitution}>UNIVERSITAS BUDDHI DHARMA</Text>
            <Text style={styles.footerCopyright}>
              Sistem Informasi Akademik Mobile • 100% Offline-First
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
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  brandHero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.subtle,
  },
  ubdLogo: {
    width: 220,
    height: 48,
  },
  heroTextContainer: {
    alignItems: 'center',
    gap: 4,
  },
  portalCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  institutionName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  institutionMotto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
    gap: spacing.lg,
  },
  cardHeader: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    paddingBottom: spacing.sm,
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
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    boxShadow: shadows.card,
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
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: spacing.sm,
  },
  demoAccountCardPressed: {
    backgroundColor: '#DBEAFE',
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
    borderColor: '#BFDBFE',
  },
  demoTextBox: {
    flex: 1,
    gap: 2,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  demoSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  demoCode: {
    fontWeight: '700',
    color: colors.primaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerContainer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.xs,
  },
  footerInstitution: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  footerCopyright: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
