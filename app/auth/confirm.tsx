import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

type ConfirmState = 'loading' | 'success' | 'error';

export default function ConfirmScreen() {
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const [state, setState] = useState<ConfirmState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function confirm() {
      if (params.error) {
        setErrorMessage(params.error_description || 'Invalid confirmation link');
        setState('error');
        return;
      }

      if (!params.code) {
        setErrorMessage('No confirmation code found');
        setState('error');
        return;
      }

      if (!supabase) {
        setErrorMessage('Service unavailable');
        setState('error');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(params.code);

      if (error) {
        if (error.message.includes('expired')) {
          setErrorMessage('This link has expired. Please sign up again to receive a new one.');
        } else {
          setErrorMessage('Invalid or already-used link. Please sign in.');
        }
        setState('error');
        return;
      }

      setState('success');
    }

    confirm();
  }, [params.code, params.error, params.error_description]);

  useEffect(() => {
    if (state === 'success') {
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {state === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#2463ff" />
            <Text style={styles.text}>Confirming your account...</Text>
          </>
        )}

        {state === 'success' && (
          <>
            <Text style={styles.icon}>---</Text>
            <Text style={styles.title}>Account Confirmed</Text>
            <Text style={styles.text}>Redirecting you to the app...</Text>
          </>
        )}

        {state === 'error' && (
          <>
            <Text style={styles.errorIcon}>---</Text>
            <Text style={styles.title}>Confirmation Failed</Text>
            <Text style={styles.text}>{errorMessage}</Text>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.buttonText}>Go to Sign In</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  icon: {
    fontSize: 48,
    color: '#10b981',
  },
  errorIcon: {
    fontSize: 48,
    color: '#F87171',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#b6c9ea',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2463ff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 16,
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
