import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { router } from 'expo-router';
import storage from '@/utils/storage';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture_url?: string;
  bio?: string;
  preferences?: {
    reality_check_frequency: string;
    lucid_dream_goal: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  forgotPassword: (
    username: string,
    email: string,
    newPassword: string
  ) => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  updatePreferences: async () => {},
  forgotPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await storage.getItem('userToken');

        if (token) {
          // Configure axios to use the token for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Fetch user data
          try {
            const response = await axios.get(`${API_URL}/api/users/me`);
            setUser(response.data);
            setIsAuthenticated(true);
          } catch (apiError) {
            console.error('API error:', apiError);
            await storage.removeItem('userToken');
          }
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      // console.log('Login response:', response.data);

      const { token, user } = response.data;

      // Save token to storage
      await storage.setItem('userToken', token);

      // Configure axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      // Navigate to home screen
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token to storage
      await storage.setItem('userToken', token);

      // Configure axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      // Navigate to home screen
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(
        'Registration error:',
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('userToken');

      // Reset state
      setUser(null);
      setIsAuthenticated(false);

      // Remove axios header
      delete axios.defaults.headers.common['Authorization'];

      // Navigate to landing page
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still reset the auth state
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/');
    }
  };

  // Update profile method
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, data);

      // Update user state with the response
      setUser((prevUser) => {
        if (!prevUser) return response.data;
        return { ...prevUser, ...response.data };
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Update profile error:',
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  };

  // Update preferences method
  const updatePreferences = async (preferences: any) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/preferences`, {
        preferences,
      });

      // Update user state with the new preferences
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          preferences: response.data.preferences || preferences,
        };
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Update preferences error:',
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || 'Failed to update preferences'
      );
    }
  };

  // Add this new method
  const forgotPassword = async (
    username: string,
    email: string,
    newPassword: string
  ) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        username,
        email,
        newPassword,
      });

      return response.data;
    } catch (error: any) {
      console.error(
        'Password reset error:',
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || 'Failed to reset password'
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
