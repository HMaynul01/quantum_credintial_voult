import { UserProfile, UserConfig } from '../types';
import api from './apiService';

// Local storage keys remain for offline caching
const USERS_INDEX_KEY = 'QAV_USERS_INDEX';
const getStorageKey = (userId: string) => `QAV_DATA_${userId}`;
const getConfigKey = (userId: string) => `QAV_CONFIG_${userId}`;

class DatabaseService {
  async init(): Promise<void> {
    // Initialization now happens on the server, but we can check health
    try {
      await api.get('db/health');
      console.log("QAV Database: Remote connection healthy.");
    } catch (e) {
      console.warn("QAV Database: Remote connection unavailable. Operating in Local Enclave mode.");
    }
  }

  async getUsers(): Promise<UserProfile[]> {
    try {
      const users = await api.get('db/users');
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));
      return users;
    } catch (e) {
      console.warn("Failed to fetch users from remote, using local cache.", e);
      const local = localStorage.getItem(USERS_INDEX_KEY);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveUser(user: UserProfile): Promise<void> {
    const currentLocal = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
    const idx = currentLocal.findIndex((u: UserProfile) => u.id === user.id);
    if (idx >= 0) currentLocal[idx] = user; else currentLocal.push(user);
    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(currentLocal));
    
    await api.post('db/user', { user });
  }

  async getUserConfig(userId: string): Promise<UserConfig | null> {
    try {
      const config = await api.get(`db/config`, { userId });
      localStorage.setItem(getConfigKey(userId), JSON.stringify(config));
      return config;
    } catch (e) {
      console.warn("Failed to fetch config from remote, using local cache.", e);
      const local = localStorage.getItem(getConfigKey(userId));
      return local ? JSON.parse(local) : null;
    }
  }

  async saveUserConfig(config: UserConfig): Promise<void> {
    localStorage.setItem(getConfigKey(config.userId), JSON.stringify(config));
    await api.post('db/config', { config });
  }

  async getVaultData(userId: string): Promise<string | null> {
    try {
      const { data } = await api.get('db/vault', { userId });
      if (data) localStorage.setItem(getStorageKey(userId), data);
      return data;
    } catch (e) {
      console.warn("Failed to fetch vault from remote, using local cache.", e);
      return localStorage.getItem(getStorageKey(userId));
    }
  }

  async saveVaultData(userId: string, encryptedData: string): Promise<void> {
    localStorage.setItem(getStorageKey(userId), encryptedData);
    await api.post('db/vault', { userId, data: encryptedData });
  }
}

export const db = new DatabaseService();
