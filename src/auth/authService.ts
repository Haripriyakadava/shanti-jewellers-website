import type { User } from './types';
import { getItem, setItem, removeItem, StorageKeys } from './storage';
import { getCurrentTenantId } from '@/lib/tenant';

const API_URL = 'http://localhost:5000/api/auth';

let currentUserCache: User | null = null;

export const authService = {
  async register(userData: Omit<User, 'id' | 'created_at'> & { password: string }): Promise<User> {
    const tenantId = await getCurrentTenantId();
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.phone_number || undefined,
        password: userData.password
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save tokens
    setItem(StorageKeys.ACCESS_TOKEN, data.accessToken);
    if (data.refreshToken) {
      setItem(StorageKeys.REFRESH_TOKEN, data.refreshToken);
    }

    const userObj = data.user || data.customer;
    const mappedUser: User = {
      id: userObj.id,
      userCode: userObj.userCode || userObj.customerCode,
      full_name: userObj.fullName,
      email: userObj.email,
      phone_number: userData.phone_number || '',
      created_at: new Date().toISOString()
    };

    this.setCurrentUser(mappedUser);
    return mappedUser;
  },

  async login(email: string, password: string): Promise<User> {
    const tenantId = await getCurrentTenantId();

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        email,
        password
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Save tokens
    setItem(StorageKeys.ACCESS_TOKEN, data.accessToken);
    if (data.refreshToken) {
      setItem(StorageKeys.REFRESH_TOKEN, data.refreshToken);
    }

    const userObj = data.user || data.customer;
    const mappedUser: User = {
      id: userObj.id,
      userCode: userObj.userCode || userObj.customerCode,
      full_name: userObj.fullName,
      email: userObj.email,
      phone_number: '',
      created_at: new Date().toISOString()
    };

    this.setCurrentUser(mappedUser);
    return mappedUser;
  },

  logout(): void {
    removeItem(StorageKeys.CURRENT_USER);
    removeItem(StorageKeys.ACCESS_TOKEN);
    removeItem(StorageKeys.REFRESH_TOKEN);
    currentUserCache = null;
  },

  async forgotPassword(email: string): Promise<void> {
    // Left as mock for now, implement API later if exists
    const resetTokens = getItem<Record<string, string>>(StorageKeys.RESET_TOKENS) || {};
    const token = crypto.randomUUID();
    resetTokens[token] = email;
    setItem(StorageKeys.RESET_TOKENS, resetTokens);
  },

  async resetPassword(_password: string): Promise<void> {
    // Mock logic
  },

  getCurrentUser(): User | null {
    if (currentUserCache) return currentUserCache;
    const user = getItem<User>(StorageKeys.CURRENT_USER);
    if (user) {
      currentUserCache = user;
    }
    return user;
  },

  setCurrentUser(user: User): void {
    setItem(StorageKeys.CURRENT_USER, user);
    currentUserCache = user;
  },

  isAuthenticated(): boolean {
    const token = getItem<string>(StorageKeys.ACCESS_TOKEN);
    return this.getCurrentUser() !== null && !!token;
  },

  async updateProfile(updates: Partial<User>): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const updatedUser = { ...currentUser, ...updates };
    this.setCurrentUser(updatedUser);
  }
};
