import { useSyncExternalStore } from 'react';
import { cartStore } from '../stores/cartStore';

/**
 * Hook to retrieve the real-time cart item count from cartStore.
 * @returns {number}
 */
export function useCartCount() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export default useCartCount;
