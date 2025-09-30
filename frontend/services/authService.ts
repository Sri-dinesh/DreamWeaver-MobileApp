import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Use SecureStore for sensitive data on native platforms, AsyncStorage for web
const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const authService = {
  // Store auth tokens securely
  async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      await secureStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        await secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  },

  // Retrieve access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  },

  // Retrieve refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  },

  // Store user data
  async storeUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  },

  // Retrieve user data
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  // Clear all auth data
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        secureStorage.removeItem(TOKEN_KEY),
        secureStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },
};