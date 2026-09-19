import { useEffect, useState } from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

type LinkState = 'exchanging' | 'ready' | 'error';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const { updatePassword, setRecoveryMode } = useAuth();

  const [linkState, setLinkState] = useState<LinkState>('exchanging');
  const [linkErrorMessage, setLinkErrorMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Exchange the code from the emailed link for a (recovery) session, and flag
  // recovery mode explicitly so AuthGate doesn't bounce us to the home tabs
  // the moment a session appears, before a new password has been set.
  useEffect(() => {
    async function exchange() {
      if (params.error) {
        setLinkErrorMessage(params.error_description || 'Invalid or expired reset link');
        setLinkState('error');
        return;
      }

      if (!params.code) {
        setLinkErrorMessage('No reset code found');
        setLinkState('error');
        return;
      }

      if (!supabase) {
        setLinkErrorMessage('Service unavailable');
        setLinkState('error');
        return;
      }

      setRecoveryMode(true);

      const { error } = await supabase.auth.exchangeCodeForSession(params.code);

      if (error) {
        setRecoveryMode(false);
        if (error.message.includes('expired')) {
          setLinkErrorMessage('This link has expired. Please request a new one.');
        } else {
          setLinkErrorMessage('Invalid or already-used link. Please request a new one.');
        }
        setLinkState('error');
        return;
      }

      setLinkState('ready');
    }

    exchange();
  }, [params.code, params.error, params.error_description, setRecoveryMode]);

  async function handleSubmit() {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const result = await updatePassword(password);

    if (result.error) {
      setErrors({ general: result.error });
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
    // Clears recovery mode; AuthGate will then take the now-fully-signed-in
    // user to the home tabs on its own.
    setRecoveryMode(false);
  }

  if (linkState === 'exchanging') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2463ff" />
          <Text style={styles.text}>Verifying your link...</Text>
        </View>
      </View>
    );
  }

  if (linkState === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Link Problem</Text>
          <Text style={styles.text}>{linkErrorMessage}</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.replace('/auth/forgot-password' as any)}
          >
            <Text style={styles.buttonText}>Request New Link</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Password Updated</Text>
          <Text style={styles.text}>Taking you to the app...</Text>
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
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Choose a new password for your account.</Text>

        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
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
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setErrors({}); }}
              placeholder="Re-enter your new password"
              placeholderTextColor="#6b7a94"
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </Pressable>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#b6c9ea',
    marginBottom: 40,
    lineHeight: 22,
  },
  text: {
    fontSize: 16,
    color: '#b6c9ea',
    textAlign: 'center',
    lineHeight: 24,
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
    paddingHorizontal: 32,
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
});