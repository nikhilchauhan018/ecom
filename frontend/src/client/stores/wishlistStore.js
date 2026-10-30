import { STORAGE_KEYS } from '../config/constants';

let wishlistIds = new Set();
const listeners = new Set();
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function initFromStorage() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        wishlistIds = new Set(parsed);
      }
    }
  } catch {
    // Ignore storage errors
  }
  initialized = true;
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.WISHLIST,
      JSON.stringify(Array.from(wishlistIds))
    );
  } catch {
    // Ignore storage quota
  }
}

export const wishlistStore = {
  subscribe(listener) {
    initFromStorage();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    initFromStorage();
    return wishlistIds;
  },

  getServerSnapshot() {
    return new Set();
  },

  has(id) {
    initFromStorage();
    return wishlistIds.has(String(id));
  },

  toggle(id) {
    initFromStorage();
    const strId = String(id);
    const next = new Set(wishlistIds);
    if (next.has(strId)) {
      next.delete(strId);
    } else {
      next.add(strId);
    }
    wishlistIds = next;
    persist();
    notify();
  },
};
