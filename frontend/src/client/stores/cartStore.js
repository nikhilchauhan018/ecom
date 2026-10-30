import { STORAGE_KEYS } from '../config/constants';

let cartItems = [
  { id: 'prod-cotton-kurti', quantity: 1 },
  { id: 'prod-linen-shirt', quantity: 1 },
];
const listeners = new Set();
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function initFromStorage() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CART);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cartItems = parsed;
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
    window.localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
  } catch {
    // Ignore storage quota
  }
}

export const cartStore = {
  subscribe(listener) {
    initFromStorage();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    initFromStorage();
    return cartItems;
  },

  getServerSnapshot() {
    return cartItems;
  },

  getCount() {
    initFromStorage();
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  addItem(productId, quantity = 1) {
    initFromStorage();
    const strId = String(productId);
    const existingIndex = cartItems.findIndex((item) => item.id === strId);
    if (existingIndex > -1) {
      cartItems = cartItems.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      cartItems = [...cartItems, { id: strId, quantity }];
    }
    persist();
    notify();
  },

  removeItem(productId) {
    initFromStorage();
    cartItems = cartItems.filter((item) => item.id !== String(productId));
    persist();
    notify();
  },
};
