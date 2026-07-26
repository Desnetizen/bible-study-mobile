### Task 2: Create Encrypted Storage Adapter

**Files:**
- Create: `src/lib/large-secure-store.ts`

**Interfaces:**
- Produces: `largeSecureStore` â€” object with `getItem(key)` and `setItem(key, value)` matching Supabase's Storage interface
- Produces: `clearAllAuthData()` â€” utility to clear all encrypted auth data

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

