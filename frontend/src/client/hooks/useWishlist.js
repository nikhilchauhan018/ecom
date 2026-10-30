import { useSyncExternalStore, useCallback } from 'react';
import { wishlistStore } from '../stores/wishlistStore';

/**
 * Hook to read and toggle wishlist status for a given product ID.
 * @param {string|number} [productId]
 * @returns {{ inWishlist: boolean, toggleWishlist: () => void, count: number }}
 */
export function useWishlist(productId) {
  const ids = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  );

  const strId = productId != null ? String(productId) : null;
  const inWishlist = strId ? ids.has(strId) : false;

  const toggleWishlist = useCallback(() => {
    if (strId) {
      wishlistStore.toggle(strId);
    }
  }, [strId]);

  return {
    inWishlist,
    toggleWishlist,
    count: ids.size,
  };
}

export default useWishlist;
