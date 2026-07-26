# Email/Password Auth Flow — Design Spec

## Overview

Replace the existing anonymous auth + device_id RLS pattern with a production-safe email/password authentication system using Supabase Auth. All users must sign up or log in; no anonymous fallback.

## Scope

**In Scope:** Encrypted session storage (LargeSecureStore), Supabase client reconfiguration, profiles table + RLS + trigger, email/password signup with validation, email/password login, email confirmation deep linking, session handling + centralized route protection, sign out, migration of existing RLS from device_id to auth.uid().

**Out of Scope:** Password reset, social login, profile editing UI, migrating anonymous users to email accounts. Password reset and signup abuse protection (captcha, rate limiting) are explicitly deferred to the next spec.

---

## 1. Dependencies

```
npx expo install expo-secure-store aes-js react-native-get-random-values
```

Already installed: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`.

---

## 2. Encrypted Storage Adapter (`src/lib/supabase.ts`)

**LargeSecureStore pattern (AES-CTR):**
- Generate random 256-bit AES key via `react-native-get-random-values`, store in `expo-secure-store`
- Session JSON encrypted with AES-CTR (`aes-js`), with random 16-byte nonce per write stored alongside ciphertext in AsyncStorage
- On read: extract nonce, decrypt from AsyncStorage
- On clear: delete from both stores

**Client config:**
```ts
createClient(url, key, {
  auth: {
    storage: largeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

**AppState listener:** `startAutoRefresh()` when active, `stopAutoRefresh()` when backgrounded.

**Cleanup:** Remove `initSupabaseSession()` and device-id import.

---

## 3. Database (`supabase/migrations/20260725000000_profiles.sql`)

**Table:**
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);
```

**RLS:** Select/update only where `id = auth.uid()`.

**Trigger:** `handle_new_user()` fires on `auth.users` insert — creates profile row server-side.

**Migrate existing RLS:** Update `user_activity` and `daniel_progress` policies from device_id to `auth.uid()`. Add `user_id` column to `daniel_progress` if missing.

**Existing device_id-linked data:** Existing device_id-linked progress data (user_activity, daniel_progress) will become inaccessible after this migration. This is acceptable for a pre-launch app with no production users. No migration path is needed.

---

## 4. Auth Service (`src/services/auth.service.ts`)

Wraps all `supabase.auth.*` calls. Screens never call supabase.auth directly.

- `signUp(email, password)` — returns `{ needsConfirmation, error? }`
- `signIn(email, password)` — returns `{ error? }`
- `signOut()` — clears session
- `getSession()` — returns current session

**Client-side validation:** Email regex, password min 8 chars, inline field errors.

**Error handling:** Generic messages (no email enumeration). "Check your email to confirm your account" for signup success.

---

## 5. Email Confirmation (`app/auth/confirm.tsx`)

- Scheme already in `app.json`: `bibleconnection`
- User adds `bibleconnection://auth-confirm` to Supabase dashboard redirect URLs
- Confirm route parses `code` query param, calls `exchangeCodeForSession(code)`
- **Before implementation:** Check Supabase dashboard Auth settings to confirm PKCE flow vs OTP flow
- **Error states:** expired links → "Link expired. Please sign up again."; already-used → "Already used. Please sign in."; malformed → "Invalid confirmation link."
- `Linking.addEventListener` in `_layout.tsx` for incoming links

---

## 6. Screens

**Signup:** Email, password, confirm password fields. Loading spinner on submit. Shows "check your inbox" on success. Follows `design.md` patterns (dark theme, Inter font, staggered animations, 44pt targets).

**Login:** Email, password fields. Loading spinner. Generic error for wrong credentials. Session listener drives navigation on success.

---

## 7. Session Handling (`src/hooks/useAuth.ts`)

Context provider exposing: `session`, `user`, `loading`, `signIn`, `signUp`, `signOut`.

**Route gating in `_layout.tsx`:**
- Session exists → `(tabs)` group
- Session null → `auth` group
- Splash screen held until `getSession()` resolves
- Remove `useEnsureAuth()` call

---

## 8. Route Structure

```
app/
  _layout.tsx          → AuthProvider + route gate
  auth/
    _layout.tsx        → Stack (login, signup, confirm)
    login.tsx          → LoginScreen wrapper
    signup.tsx         → SignupScreen wrapper
    confirm.tsx        → Email confirmation handler
  (tabs)/
    ...existing tabs
```

---

## 9. Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/supabase.ts` | Modify — encrypted storage, remove device_id |
| `src/lib/large-secure-store.ts` | Create — encrypted storage adapter |
| `src/services/auth.service.ts` | Create |
| `src/hooks/useAuth.tsx` | Create |
| `src/screens/auth/LoginScreen.tsx` | Create |
| `src/screens/auth/SignupScreen.tsx` | Create |
| `app/auth/_layout.tsx` | Create |
| `app/auth/login.tsx` | Create |
| `app/auth/signup.tsx` | Create |
| `app/auth/confirm.tsx` | Create |
| `app/_layout.tsx` | Modify — AuthProvider + route gate |
| `supabase/migrations/20260725000000_profiles.sql` | Create |
| `src/lib/auth.ts` | Delete |
| `src/hooks/useEnsureAuth.ts` | Delete |
