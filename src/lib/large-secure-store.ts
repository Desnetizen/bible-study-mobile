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
  return arrayToBase64(combined);
}

function decrypt(key: Uint8Array, ciphertext: string): string {
  const combined = base64ToArray(ciphertext);
  const nonce = combined.slice(0, 16);
  const encrypted = combined.slice(16);
  const counter = new AES.ModeOfOperation.ctr(key, nonce);
  const decrypted = counter.decrypt(encrypted);
  return new TextDecoder().decode(decrypted);
}

function arrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArray(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const largeSecureStore = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const encrypted = await AsyncStorage.getItem(key);
      if (!encrypted) return null;
      const encryptionKey = getOrCreateKey();
      return decrypt(encryptionKey, encrypted);
    } catch (err) {
      console.error('[LargeSecureStore] getItem error:', err);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const encryptionKey = getOrCreateKey();
      const encrypted = encrypt(encryptionKey, value);
      await AsyncStorage.setItem(key, encrypted);
    } catch (err) {
      console.error('[LargeSecureStore] setItem error:', err);
      throw err;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error('[LargeSecureStore] removeItem error:', err);
    }
  },
};

export async function clearAllAuthData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(k => k.startsWith('sb-'));
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
    }
    await SecureStore.deleteItemAsync(KEY_ALIAS);
  } catch (err) {
    console.error('[LargeSecureStore] clearAllAuthData error:', err);
  }
}
