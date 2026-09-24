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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError(undefined);
    setLoading(true);

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.body}>
            If an account exists for
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.body}>
            we have sent a link to reset your password. Follow it to choose a new one.
          </Text>

          <Link href={'/auth/login' as any} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the email on your account and we will send you a link to reset your password.
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={email}
              onChangeText={(text) => { setEmail(text); setError(undefined); }}
              placeholder="you@example.com"
              placeholderTextColor="#6b7a94"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
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
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Link href={'/auth/login' as any}>
              <Text style={styles.footerLink}>Back to Sign In</Text>
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
    lineHeight: 22,
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
  footerLink: {
    color: '#5fa5ff',
    fontSize: 14,
    fontWeight: '600',
  },
});