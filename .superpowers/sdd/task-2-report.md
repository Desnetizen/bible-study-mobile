# Task 2: LargeSecureStore Encrypted Storage Adapter

## What I Implemented

Created `src/lib/large-secure-store.ts` — an encrypted storage adapter using AES-CTR encryption via `aes-js`, with the AES key stored in `expo-secure-store` and encrypted tokens stored in `AsyncStorage`. Exposes `largeSecureStore` (matching Supabase's storage interface with `getItem`, `setItem`, `removeItem`) and `clearAllAuthData()`.

## Files Changed

- `src/lib/large-secure-store.ts` — new file (64 lines)

## Self-Review Findings

- Code matches the brief exactly.
- Uses CTR mode with random 16-byte nonce per encryption, which is correct for AES-CTR.
- `getOrCreateKey` reads/writes `expo-secure-store` synchronously (the synchronous API) — fine since this runs on JS thread and the calls are fast.
- `btoa`/`atob` are used for base64 encoding; these work in Hermes on React Native.

## Issues or Concerns

None.
