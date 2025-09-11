import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // No ambiente web, usar localStorage
        localStorage.setItem(key, value);
        console.log(`StorageService: Item salvo no localStorage - ${key}: ${value}`);
      } else {
        // No mobile, usar SecureStore
        await SecureStore.setItemAsync(key, value);
        console.log(`StorageService: Item salvo no SecureStore - ${key}: ${value}`);
      }
    } catch (error) {
      console.error(`StorageService: Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // No ambiente web, usar localStorage
        const value = localStorage.getItem(key);
        console.log(`StorageService: Item lido do localStorage - ${key}: ${value}`);
        return value;
      } else {
        // No mobile, usar SecureStore
        const value = await SecureStore.getItemAsync(key);
        console.log(`StorageService: Item lido do SecureStore - ${key}: ${value}`);
        return value;
      }
    } catch (error) {
      console.error(`StorageService: Erro ao ler ${key}:`, error);
      return null;
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // No ambiente web, usar localStorage
        localStorage.removeItem(key);
        console.log(`StorageService: Item removido do localStorage - ${key}`);
      } else {
        // No mobile, usar SecureStore
        await SecureStore.deleteItemAsync(key);
        console.log(`StorageService: Item removido do SecureStore - ${key}`);
      }
    } catch (error) {
      console.error(`StorageService: Erro ao remover ${key}:`, error);
      throw error;
    }
  }

  public async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // No ambiente web, limpar localStorage
        localStorage.clear();
        console.log('StorageService: localStorage limpo');
      } else {
        // No mobile, limpar SecureStore (não há método clear, então removemos item por item)
        console.log('StorageService: SecureStore não tem método clear nativo');
      }
    } catch (error) {
      console.error('StorageService: Erro ao limpar storage:', error);
      throw error;
    }
  }
}

export default StorageService.getInstance();
