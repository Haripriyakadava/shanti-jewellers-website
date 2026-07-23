// A generic wrapper around localStorage to ensure type safety

const KEYS = {
  USERS: 'shanti_users',
  CURRENT_USER: 'shanti_current_user',
  ACCESS_TOKEN: 'shanti_access_token',
  REFRESH_TOKEN: 'shanti_refresh_token',
  ADDRESSES: 'shanti_addresses',
  ORDERS: 'shanti_orders',
  WISHLIST: 'shanti_wishlist',
  RESET_TOKENS: 'shanti_reset_tokens'
} as const;

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage`, error);
  }
}

export const StorageKeys = KEYS;
