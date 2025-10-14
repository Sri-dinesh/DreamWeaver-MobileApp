import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

class Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Use SecureStore for native platforms
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(key, value);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.removeItem(key);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      // If deleteItemAsync fails, try setting to empty string as fallback
      console.error(`Error removing item ${key}:`, error);
      try {
        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync(key, '');
        }
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${key}:`, fallbackError);
      }
    }
  }
}

export default new Storage();