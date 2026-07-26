# Email/Password Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace anonymous auth with email/password login, encrypted session storage, and centralized route protection.

**Architecture:** LargeSecureStore pattern for encrypted sessions, auth service wrapping Supabase Auth, context-based session management, Expo Router route gating.

**Tech Stack:** Expo SDK 54, Supabase Auth, expo-secure-store, aes-js, react-native-get-random-values, Expo Router

## Global Constraints

- Expo SDK 54 (expo@~54.0.35)
- Supabase JS v2 (@supabase/supabase-js@^2.106.2)
- Never store service role key in client code
- Never use plain AsyncStorage for tokens
- Never reveal email enumeration through error messages
- Follow design.md patterns for all UI (dark theme, Inter font, staggered animations)
- 44pt minimum touch targets
- No comments in code unless explicitly requested

---

### Task 1: Install Dependencies

**Files:** None (terminal only)

- [ ] **Step 1: Install required packages**

Run: `npx expo install expo-secure-store aes-js react-native-get-random-values`

Expected: All three packages install successfully.

- [ ] **Step 2: Verify installations**

Run: `npm list expo-secure-store aes-js react-native-get-random-values`

Expected: All three appear in the dependency tree with versions.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install auth dependencies (secure-store, aes-js, random-values)"
```

---

### Task 2: Create Encrypted Storage Adapter

**Files:**
- Create: `src/lib/large-secure-store.ts`

**Interfaces:**
- Produces: `largeSecureStore` — object with `getItem(key)` and `setItem(key, value)` matching Supabase's Storage interface
- Produces: `clearAllAuthData()` — utility to clear all encrypted auth data

- [ ] **Step 1: Create the LargeSecureStore adapter**

```typescript
// src/lib/large-secure-store.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AES from 'aes-js';
import 'react-native-get-random-values';

const KEY_ALIAS = 'bibleconnection-encryption-key';

function getOrCreateKey(): Uint8Array {
  const existing = SecureStore.getItem(KEY_ALIAS);
  if (existing) {
    return new Uint8Array(JSON.parse(existing));
  }
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  SecureStore.setItem(KEY_ALIAS, JSON.stringify(Array.from(key)));
  return key;
}

function encrypt(key: Uint8Array, plaintext: string): string {
  const textBytes = new TextEncoder().encode(plaintext);
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);
  const counter = new AES.ModeOfOperation.ctr(key, nonce);
  const encrypted = counter.encrypt(textBytes);
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce, 0);
  combined.set(encrypted, nonce.length);
  return btoa(String.fromCharCode(...combined));
}

function decrypt(key: Uint8Array, ciphertext: string): string {
  const combined = new Uint8Array(
    atob(ciphertext).split('').map(c => c.charCodeAt(0))
  );
  const nonce = combined.slice(0, 16);
  const encrypted = combined.slice(16);
  const counter = new AES.ModeOfOperation.ctr(key, nonce);
  const decrypted = counter.decrypt(encrypted);
  return new TextDecoder().decode(decrypted);
}

export const largeSecureStore = {
  getItem: async (key: string): Promise<string | null> => {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    const encryptionKey = getOrCreateKey();
    return decrypt(encryptionKey, encrypted);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    const encryptionKey = getOrCreateKey();
    const encrypted = encrypt(encryptionKey, value);
    await AsyncStorage.setItem(key, encrypted);
  },
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
};

export async function clearAllAuthData(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_ALIAS);
  const keys = await AsyncStorage.getAllKeys();
  const authKeys = keys.filter(k => k.includes('supabase'));
  await AsyncStorage.multiRemove(authKeys);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/large-secure-store.ts
git commit -m "feat: add LargeSecureStore encrypted storage adapter"
```

---

### Task 3: Update Supabase Client

**Files:**
- Modify: `src/lib/supabase.ts`

**Interfaces:**
- Consumes: `largeSecureStore` from Task 2
- Produces: `supabase` — configured Supabase client
- Produces: `startAuthListeners()`, `stopAuthListeners()`

- [ ] **Step 1: Read the existing file**

Read: `src/lib/supabase.ts`

- [ ] **Step 2: Replace with encrypted storage client**

```typescript
// src/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, SUPABASE_PUBLIC_KEY, HAS_SUPABASE_CONFIG } from '../constants/mobile-env';
import { largeSecureStore } from './large-secure-store';

export const supabase = HAS_SUPABASE_CONFIG
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_PUBLIC_KEY, {
      auth: {
        storage: largeSecureStore,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function startAuthListeners(): void {
  if (!supabase) return;
  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export function stopAuthListeners(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: update supabase client with encrypted storage and AppState listener"
```

---

### Task 4: Create Profiles Migration

**Files:**
- Create: `supabase/migrations/20260725000000_profiles.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260725000000_profiles.sql

-- ============================================================
-- PROFILES TABLE
-- ============================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- MIGRATE user_activity RLS FROM device_id TO auth.uid()
-- NOTE: Existing device_id-linked data becomes inaccessible.
-- Acceptable for pre-launch app with no production users.
-- ============================================================

drop policy if exists "device_id read access" on public.user_activity;
drop policy if exists "device_id insert access" on public.user_activity;

create policy "Users read own activity"
  on public.user_activity for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own activity"
  on public.user_activity for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- MIGRATE daniel_progress RLS FROM device_id TO auth.uid()
-- Add user_id column if missing
-- ============================================================

alter table public.daniel_progress
  add column if not exists user_id uuid references auth.users(id);

drop policy if exists "device_id read access" on public.daniel_progress;
drop policy if exists "device_id insert access" on public.daniel_progress;
drop policy if exists "device_id update access" on public.daniel_progress;

create policy "Users read own progress"
  on public.daniel_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own progress"
  on public.daniel_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own progress"
  on public.daniel_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260725000000_profiles.sql
git commit -m "feat: add profiles table, RLS, trigger, and migrate RLS policies"
```

---

### Task 5: Create Auth Service

**Files:**
- Create: `src/services/auth.service.ts`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabase.ts`
- Produces: `authService` object with `signUp`, `signIn`, `signOut`, `getSession`

- [ ] **Step 1: Create the auth service**

```typescript
// src/services/auth.service.ts
import { supabase } from '../lib/supabase';

type AuthResult = {
  error?: string;
};

type SignUpResult = AuthResult & {
  needsConfirmation?: boolean;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

export const authService = {
  async signUp(email: string, password: string): Promise<SignUpResult> {
    if (!isValidEmail(email)) {
      return { error: 'Please enter a valid email address' };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { error: passwordError };
    }

    if (!supabase) {
      return { error: 'Service unavailable' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: 'Something went wrong. Please try again.' };
    }

    return { needsConfirmation: true };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isValidEmail(email)) {
      return { error: 'Please enter a valid email address' };
    }

    if (!password) {
      return { error: 'Password is required' };
    }

    if (!supabase) {
      return { error: 'Service unavailable' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: 'Invalid email or password' };
    }

    return {};
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/auth.service.ts
git commit -m "feat: add auth service wrapping Supabase Auth calls"
```

---

### Task 6: Create useAuth Hook

**Files:**
- Create: `src/hooks/useAuth.tsx`

**Interfaces:**
- Consumes: `authService` from Task 5, `supabase` from `src/lib/supabase.ts`
- Produces: `AuthProvider`, `useAuth` hook

- [ ] **Step 1: Create the auth context and provider**

```tsx
// src/hooks/useAuth.tsx
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return authService.signIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return authService.signUp(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signUp,
    signOut,
  }), [session, loading, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAuth.tsx
git commit -m "feat: add useAuth hook with session context provider"
```

---

### Task 7: Create Login Screen

**Files:**
- Create: `src/screens/auth/LoginScreen.tsx`

**Interfaces:**
- Consumes: `useAuth` from Task 6
- Produces: `LoginScreen` component

- [ ] **Step 1: Create the login screen**

```tsx
// src/screens/auth/LoginScreen.tsx
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrors({ general: error });
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

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
              placeholder="Enter your password"
              placeholderTextColor="#6b7a94"
              secureTextEntry
              autoComplete="password"
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
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
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/auth/signup" style={styles.footerLink}>Sign Up</Link>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/auth/LoginScreen.tsx
git commit -m "feat: add login screen with form validation"
```

---

### Task 8: Create Signup Screen

**Files:**
- Create: `src/screens/auth/SignupScreen.tsx`

**Interfaces:**
- Consumes: `useAuth` from Task 6
- Produces: `SignupScreen` component

- [ ] **Step 1: Create the signup screen**

```tsx
// src/screens/auth/SignupScreen.tsx
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

          <Link href="/auth/login" style={({ pressed }) => [
            styles.backToLogin,
            pressed && { opacity: 0.8 },
          ]}>
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
            <Link href="/auth/login" style={styles.footerLink}>Sign In</Link>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/auth/SignupScreen.tsx
git commit -m "feat: add signup screen with validation and confirmation state"
```

---

### Task 9: Create Auth Route Layout and Wrappers

**Files:**
- Create: `app/auth/_layout.tsx`
- Create: `app/auth/login.tsx`
- Create: `app/auth/signup.tsx`

- [ ] **Step 1: Create auth layout**

```tsx
// app/auth/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#07111F' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create login route wrapper**

```tsx
// app/auth/login.tsx
import LoginScreen from '../../src/screens/auth/LoginScreen';

export default function LoginRoute() {
  return <LoginScreen />;
}
```

- [ ] **Step 3: Create signup route wrapper**

```tsx
// app/auth/signup.tsx
import SignupScreen from '../../src/screens/auth/SignupScreen';

export default function SignupRoute() {
  return <SignupScreen />;
}
```

- [ ] **Step 4: Commit**

```bash
git add app/auth/
git commit -m "feat: add auth route layout and screen wrappers"
```

---

### Task 10: Create Email Confirmation Handler

**Files:**
- Create: `app/auth/confirm.tsx`

- [ ] **Step 1: Create the confirmation handler**

```tsx
// app/auth/confirm.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/auth/confirm.tsx
git commit -m "feat: add email confirmation handler with error states"
```

---

### Task 11: Update Root Layout with AuthProvider and Route Gating

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Read the existing file**

Read: `app/_layout.tsx`

- [ ] **Step 2: Replace the file content**

```tsx
// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { AppReadinessProvider, useAppReadiness } from '@/lib/app-readiness';
import { preloadStartupImages } from '@/lib/startup-assets';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { startAuthListeners, stopAuthListeners } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/auth/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  return null;
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { appContentReady, splashAnimationComplete, markAppContentReady, markSplashAnimationComplete } = useAppReadiness();
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setNativeSplashHidden(true);
        }
      });

    SystemUI.setBackgroundColorAsync('#07111F').catch(() => {});
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#07111F').catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void preloadStartupImages().finally(() => {
      if (isMounted) {
        markAppContentReady();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [markAppContentReady]);

  useEffect(() => {
    startAuthListeners();
    return () => stopAuthListeners();
  }, []);

  const appIsReady = nativeSplashHidden && appContentReady;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="daniel-study/[chapter]" options={{ presentation: 'modal', title: 'Daniel Study' }} />
          <Stack.Screen name="recent-activity" options={{ headerShown: false }} />
          <Stack.Screen name="badges" options={{ headerShown: false }} />
          <Stack.Screen name="pre-exilic-detail" options={{ headerShown: false }} />
          <Stack.Screen name="babylon-detail" options={{ headerShown: false }} />
          <Stack.Screen name="medo-persian-detail" options={{ headerShown: false }} />
          <Stack.Screen name="greek-detail" options={{ headerShown: false }} />
          <Stack.Screen name="roman-detail" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />

        {!splashAnimationComplete && (
          <AnimatedSplashScreen
            isReady={appIsReady}
            onAnimationComplete={markSplashAnimationComplete}
          />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppReadinessProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </AppReadinessProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: add AuthProvider and route gating to root layout"
```

---

### Task 12: Clean Up Old Auth Files

**Files:**
- Delete: `src/lib/auth.ts`
- Delete: `src/hooks/useEnsureAuth.ts`

- [ ] **Step 1: Delete old auth files**

Run: `rm src/lib/auth.ts src/hooks/useEnsureAuth.ts`

- [ ] **Step 2: Verify no remaining imports**

Run: `grep -r "useEnsureAuth\|from.*lib/auth" src/ app/`

Expected: No results.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old anonymous auth files"
```

---

### Task 13: Verify and Test

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`

Expected: No errors.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address typecheck/lint issues from auth integration"
```
