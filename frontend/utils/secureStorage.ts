import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    // Fallback: If SecureStore fails on native, we might be out of luck.
    // On web, localStorage failure is also problematic.
    // We could try AsyncStorage here as another fallback if needed.
    if (Platform.OS === 'web') {
      try {
        // Attempt fallback to localStorage again, though unlikely to work if first attempt failed
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Both SecureStore and localStorage failed:', e);
      }
    } else {
      console.error(
        'SecureStore failed and no suitable fallback on native platform.'
      );
    }
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      return localStorage.getItem(key);
    } else {
      // Use SecureStore for native platforms
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    // Fallback
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Both SecureStore and localStorage failed:', e);
        return null;
      }
    } else {
      console.error(
        'SecureStore failed and no suitable fallback on native platform.'
      );
      return null;
    }
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      localStorage.removeItem(key);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    // Fallback
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Both SecureStore and localStorage failed:', e);
      }
    } else {
      // If SecureStore.delete fails, try setting to empty string
      try {
        await SecureStore.setItemAsync(key, '');
      } catch (e) {
        console.error('SecureStore delete and set empty string failed:', e);
      }
    }
  }
};
