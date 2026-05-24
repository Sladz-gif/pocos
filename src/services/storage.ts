// Storage service abstraction layer for offline-first architecture
// This provides a unified interface that can work with MMKV, SecureStore, or localStorage

class StorageService {
  private mmkv: any = null;

  constructor() {
    try {
      // MMKV will be initialized when dependencies are installed
      // For now, we'll use a fallback
    } catch (error) {
      console.warn('MMKV not available, using fallback storage');
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.mmkv) {
        this.mmkv.set(key, value);
      } else {
        // Fallback to localStorage for web development
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.mmkv) {
        return this.mmkv.getString(key) || null;
      } else {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
      }
      return null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.mmkv) {
        this.mmkv.delete(key);
      } else {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.setItem(key, jsonString);
    } catch (error) {
      console.error('Storage setJSON error:', error);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.getItem(key);
      if (jsonString) {
        return JSON.parse(jsonString) as T;
      }
      return null;
    } catch (error) {
      console.error('Storage getJSON error:', error);
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.mmkv) {
        this.mmkv.clearAll();
      } else {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.mmkv) {
        return this.mmkv.getAllKeys();
      } else {
        if (typeof localStorage !== 'undefined') {
          return Object.keys(localStorage);
        }
      }
      return [];
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

export const storage = new StorageService();

// Secure storage for sensitive data (PINs, tokens, etc.)
class SecureStorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Expo SecureStore will be used when dependencies are installed
      // For now, use regular storage with a prefix
      await storage.setItem(`secure_${key}`, value);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await storage.getItem(`secure_${key}`);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await storage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  }
}

export const secureStorage = new SecureStorageService();
