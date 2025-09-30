import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { api } from '@/api/client';
import { authService } from '@/services/authService';
import { AuthContextType, User } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (isMounted.current) setIsLoading(true);
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        // Try to get user data from storage first
        const userData = await authService.getUserData();
        if (userData) {
          if (isMounted.current) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          // If no user data in storage, fetch from API
          try {
            const profile = await api.user.getProfile();
            if (isMounted.current) {
              setUser(profile);
              setIsAuthenticated(true);
            }
            await authService.storeUserData(profile);
          } catch (error) {
            // If API call fails, clear auth data
            await authService.clearAuthData();
            if (isMounted.current) setIsAuthenticated(false);
          }
        }
      } else {
        if (isMounted.current) setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      if (isMounted.current) setIsAuthenticated(false);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (isMounted.current) setIsLoading(true);
      
      // For development - simulate successful login
      if (process.env.NODE_ENV === 'development') {
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email,
          avatar: null,
          createdAt: new Date().toISOString(),
        };
        
        const mockTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        };
        
        await authService.storeTokens(mockTokens.accessToken, mockTokens.refreshToken);
        await authService.storeUserData(mockUser);
        setUser(mockUser);
        setIsAuthenticated(true);
      } else {
        const response = await api.auth.login(email, password);
        
        if (response.user && response.tokens) {
          await authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
          await authService.storeUserData(response.user);
          setUser(response.user);
          setIsAuthenticated(true);
        }
      }
      await authService.storeUserData(userData);
      
      if (isMounted.current) {
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      if (isMounted.current) setIsLoading(true);
      
      // For development - simulate successful registration
      if (process.env.NODE_ENV === 'development') {
        const mockUser = {
          id: Date.now().toString(),
          name,
          email,
          avatar: null,
          createdAt: new Date().toISOString(),
        };
        
        const mockTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        };
        
        await authService.storeTokens(mockTokens.accessToken, mockTokens.refreshToken);
        await authService.storeUserData(mockUser);
        setUser(mockUser);
        setIsAuthenticated(true);
      } else {
        const response = await api.auth.register(name, email, password);
        
        if (response.user && response.tokens) {
          await authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
          await authService.storeUserData(response.user);
          setUser(response.user);
          setIsAuthenticated(true);
        }
      }
      await authService.storeUserData(userData);
      
      if (isMounted.current) {
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isMounted.current) setIsLoading(true);
      
      // Call logout API
      try {
        await api.auth.logout();
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      }
      
      // Clear all auth data
      await authService.clearAuthData();
      
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await api.user.updateProfile(userData);
      if (isMounted.current) setUser(updatedUser);
      await authService.storeUserData(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}