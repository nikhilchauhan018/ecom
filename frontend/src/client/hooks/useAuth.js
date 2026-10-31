import { useSyncExternalStore } from 'react';
import { authStore } from '../stores/authStore';

/**
 * Reads auth state.
 * @returns {{ status: 'loading'|'authenticated'|'anonymous', user: null | { id: string, name: string, email: string, phoneMasked: string, phoneVerified: boolean, createdAt: string }, expiresAt: number|null, reason: string|null, isAuthenticated: boolean }}
 */
export function useAuth() {
  const snapshot = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );
  return { ...snapshot, isAuthenticated: snapshot.status === 'authenticated' };
}

export default useAuth;
