import * as SecureStore from 'expo-secure-store';

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    // Fallback to localStorage if SecureStore fails
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Both SecureStore and localStorage failed:', e);
    }
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    // Fallback to localStorage
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Both SecureStore and localStorage failed:', e);
      return null;
    }
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    // Try the original method
    if (typeof SecureStore.deleteItemAsync === 'function') {
      await SecureStore.deleteItemAsync(key);
    } else {
      // Fallback to setting empty string
      await SecureStore.setItemAsync(key, '');
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    // Fallback to localStorage
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Both SecureStore and localStorage failed:', e);
    }
  }
};
