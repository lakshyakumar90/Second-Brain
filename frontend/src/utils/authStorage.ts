import type { User } from '../types/auth';

interface AuthStorageData {
  user: User;
  timestamp: number;
  expiresAt: number;
}

const AUTH_STORAGE_KEY = 'neuemonicore_auth';
const DEFAULT_EXPIRY_HOURS = 24; // 24 hours

export class AuthStorage {
  // Store user data with expiration
  static setUser(user: User, expiryHours: number = DEFAULT_EXPIRY_HOURS): void {
    try {
      const now = Date.now();
      const expiresAt = now + (expiryHours * 60 * 60 * 1000); // Convert hours to milliseconds
      
      const authData: AuthStorageData = {
        user,
        timestamp: now,
        expiresAt
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  // Get user data if not expired
  static getUser(): User | null {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedData) return null;

      const authData: AuthStorageData = JSON.parse(storedData);
      const now = Date.now();

      // Check if data has expired
      if (now > authData.expiresAt) {
        // Remove expired data
        this.removeUser();
        return null;
      }

      return authData.user;
    } catch (error) {
      console.error('Failed to retrieve auth data:', error);
      // Remove corrupted data
      this.removeUser();
      return null;
    }
  }

  // Check if user data exists and is valid
  static isUserDataValid(): boolean {
    const user = this.getUser();
    return user !== null;
  }

  // Remove user data from storage
  static removeUser(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove auth data:', error);
    }
  }

  // Update stored user data (preserves expiration)
  static updateUser(updatedUser: User): void {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedData) {
        // If no existing data, create new entry
        this.setUser(updatedUser);
        return;
      }

      const authData: AuthStorageData = JSON.parse(storedData);
      const now = Date.now();

      // Check if current data is still valid
      if (now > authData.expiresAt) {
        // If expired, create new entry
        this.setUser(updatedUser);
        return;
      }

      // Update user data while preserving expiration
      authData.user = updatedUser;
      authData.timestamp = now;

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to update auth data:', error);
      // Fallback to creating new entry
      this.setUser(updatedUser);
    }
  }

  // Get expiration time for debugging
  static getExpirationTime(): Date | null {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedData) return null;

      const authData: AuthStorageData = JSON.parse(storedData);
      return new Date(authData.expiresAt);
    } catch (error) {
      return null;
    }
  }

  // Check if data will expire soon (within specified minutes)
  static willExpireSoon(withinMinutes: number = 30): boolean {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedData) return false;

      const authData: AuthStorageData = JSON.parse(storedData);
      const now = Date.now();
      const warningTime = authData.expiresAt - (withinMinutes * 60 * 1000);

      return now >= warningTime && now < authData.expiresAt;
    } catch (error) {
      return false;
    }
  }
} 