import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit() {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await signUp(email, password);

    if (result.error) {
      setErrors({ general: result.error });
    } else if (result.needsConfirmation) {
      setNeedsConfirmation(true);
    }

    setLoading(false);
  }

  if (needsConfirmation) {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.body}>
            We sent a confirmation link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.body}>
            Click the link in your email to confirm your account, then come back and sign in.
          </Text>

          <Link href={'/auth/login' as any} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Go to Sign In</Text>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Bible Connection</Text>

        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={(text) => { setEmail(text); setErrors({}); }}
              placeholder="you@example.com"
              placeholderTextColor="#6b7a94"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={(text) => { setPassword(text); setErrors({}); }}
              placeholder="Minimum 8 characters"
              placeholderTextColor="#6b7a94"
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setErrors({}); }}
              placeholder="Re-enter your password"
              placeholderTextColor="#6b7a94"
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href={'/auth/login' as any}>
              <Text style={styles.footerLink}>Sign In</Text>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b6c9ea',
    marginBottom: 40,
  },
  body: {
    fontSize: 16,
    color: '#dde9ff',
    lineHeight: 24,
    marginBottom: 16,
  },
  emailHighlight: {
    color: '#5fa5ff',
    fontWeight: '600',
  },
  backToLogin: {
    marginTop: 24,
    alignSelf: 'flex-start',
  },
  backToLoginText: {
    color: '#5fa5ff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dde9ff',
  },
  input: {
    backgroundColor: '#1a2947',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(55, 139, 255, 0.12)',
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  fieldError: {
    fontSize: 12,
    color: '#F87171',
  },
  button: {
    backgroundColor: '#2463ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#b6c9ea',
    fontSize: 14,
  },
  footerLink: {
    color: '#5fa5ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
