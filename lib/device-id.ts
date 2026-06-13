import 'expo-sqlite/localStorage/install';

const DEVICE_ID_KEY = 'bible-connection:device-id:v1';

/**
 * Returns a persistent, anonymous device identifier.
 * Creates and stores one on first call.
 */
export function getOrCreateDeviceId(): string {
  if (typeof localStorage === 'undefined') {
    return 'device';
  }

  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) {
      return existing;
    }

    const nextId =
      globalThis.crypto?.randomUUID?.() ??
      `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, nextId);
    return nextId;
  } catch {
    return 'device';
  }
}
