import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Alert } from 'react-native';
import storage from '@/utils/storage';

// Create the main API client instance
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000, // 15-second timeout for security
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to add auth tokens
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get auth token from secure storage
      const token = await storage.getItem('userToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log(
        `✅ API Success: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          await storage.setItem('userToken', accessToken);
          if (newRefreshToken) {
            await storage.setItem('refreshToken', newRefreshToken);
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await handleUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    // Centralized error handling
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      console.error(`❌ API Error ${status}:`, data);

      switch (status) {
        case 401:
          await handleUnauthorized();
          break;
        case 403:
          showUserFriendlyError(
            'Access denied. Please check your permissions.'
          );
          break;
        case 404:
          showUserFriendlyError('The requested resource was not found.');
          break;
        case 429:
          showUserFriendlyError('Too many requests. Please try again later.');
          break;
        case 500:
          showUserFriendlyError('Server error. Please try again later.');
          break;
        default:
          showUserFriendlyError(
            data?.message || 'An unexpected error occurred.'
          );
      }
    } else if (error.request) {
      // Network error
      console.error('❌ Network Error:', error.request);
      showUserFriendlyError('Network error. Please check your connection.');
    } else {
      // Request setup error
      console.error('❌ Request Error:', error.message);
      showUserFriendlyError('Request failed. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Helper functions
async function handleUnauthorized() {
  try {
    await Promise.all([
      storage.removeItem('userToken'),
      storage.removeItem('refreshToken')
    ]);
    // Navigate to login screen - this would be handled by your navigation system
    console.log('User logged out due to unauthorized access');
  } catch (error) {
    console.error('Error handling unauthorized access:', error);
  }
}

function showUserFriendlyError(message: string) {
  Alert.alert('Error', message, [{ text: 'OK' }]);
}

// API endpoint functions with proper error handling and typing
export const api = {
  // Auth API
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },

    register: async (name: string, email: string, password: string) => {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    },

    logout: async () => {
      const response = await apiClient.post('/auth/logout');
      await Promise.all([
        storage.removeItem('userToken'),
        storage.removeItem('refreshToken')
      ]);
      return response.data;
    },

    refreshToken: async (refreshToken: string) => {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data;
    },
  },

  // Dreams API
  dreams: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }) => {
      const response = await apiClient.get('/dreams', { params });
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/dreams/${id}`);
      return response.data;
    },

    create: async (dreamData: any) => {
      const response = await apiClient.post('/dreams', dreamData);
      return response.data;
    },

    update: async (id: string, dreamData: any) => {
      const response = await apiClient.put(`/dreams/${id}`, dreamData);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/dreams/${id}`);
      return response.data;
    },

    analyze: async (dreamContent: string) => {
      const response = await apiClient.post('/dreams/analyze', {
        content: dreamContent,
      });
      return response.data;
    },

    getShared: async (
      visibility: 'public' | 'friends',
      params?: { page?: number; limit?: number }
    ) => {
      const response = await apiClient.get(`/dreams/shared/${visibility}`, {
        params,
      });
      return response.data;
    },
  },

  // User API
  user: {
    getProfile: async () => {
      const response = await apiClient.get('/user/profile');
      return response.data;
    },

    updateProfile: async (userData: any) => {
      const response = await apiClient.put('/user/profile', userData);
      return response.data;
    },

    uploadAvatar: async (formData: FormData) => {
      const response = await apiClient.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  },

  // Analytics API
  analytics: {
    getDreamStats: async () => {
      const response = await apiClient.get('/analytics/dreams');
      return response.data;
    },

    getSleepStats: async () => {
      const response = await apiClient.get('/analytics/sleep');
      return response.data;
    },

    getEmotionStats: async () => {
      const response = await apiClient.get('/api/analytics/emotions');
      return response.data;
    },

    getDreamConsistency: async () => {
      const response = await apiClient.get('/api/analytics/consistency');
      return response.data;
    },

    getEmotionalSleepMap: async () => {
      const response = await apiClient.get('/api/analytics/emotional-map');
      return response.data;
    },

    getDreamEmotionsDistribution: async () => {
      const response = await apiClient.get('/api/analytics/emotions-distribution');
      return response.data;
    },

    getSleepDuration: async () => {
      const response = await apiClient.get('/api/analytics/sleep-duration');
      return response.data;
    },

    getLucidDreamsPerDay: async () => {
      const response = await apiClient.get('/api/analytics/lucid-dreams');
      return response.data;
    },

    getSleepDreamCorrelations: async () => {
      const response = await apiClient.get('/api/analytics/correlations');
      return response.data;
    },
  },

  // Sleep API
  sleep: {
    getPlans: async () => {
      const response = await apiClient.get('/sleep/plans');
      return response.data;
    },

    createPlan: async (planData: any) => {
      const response = await apiClient.post('/sleep/plans', planData);
      return response.data;
    },

    getRecordings: async () => {
      const response = await apiClient.get('/sleep/recordings');
      return response.data;
    },

    uploadRecording: async (formData: FormData) => {
      const response = await apiClient.post('/sleep/recordings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  },

  // Community API
  community: {
    getPublicDreams: async (params?: { page?: number; limit?: number }) => {
      const response = await apiClient.get('/community/dreams', { params });
      return response.data;
    },

    getFriends: async () => {
      const response = await apiClient.get('/community/friends');
      return response.data;
    },

    sendFriendRequest: async (userId: string) => {
      const response = await apiClient.post('/community/friends/request', {
        userId,
      });
      return response.data;
    },

    acceptFriendRequest: async (requestId: string) => {
      const response = await apiClient.post(
        `/community/friends/accept/${requestId}`
      );
      return response.data;
    },

    searchUsers: async (query: string) => {
      const response = await apiClient.get('/community/search', {
        params: { q: query },
      });
      return response.data;
    },
  },

  // AI API
  ai: {
    chat: async (message: string, conversationId?: string) => {
      const response = await apiClient.post('/ai/chat', {
        message,
        conversationId,
      });
      return response.data;
    },

    generatePrompt: async (type: string, theme: string) => {
      const response = await apiClient.post('/ai/generate-prompt', {
        promptType: type,
        theme,
      });
      return response.data;
    },

    generateAffirmation: async (text: string) => {
      const response = await apiClient.post('/ai/generate-affirmation', {
        text,
      });
      return response.data;
    },

    getPromptHistory: async () => {
      const response = await apiClient.get('/ai/history');
      return response.data;
    },

    deletePrompt: async (id: number) => {
      const response = await apiClient.delete(`/ai/history/${id}`);
      return response.data;
    },

    analyzeDream: async (content: string) => {
      const response = await apiClient.post('/ai/analyze-dream', { content });
      return response.data;
    },
  },

  // Spirit Chat API
  spirit: {
    getChatHistory: async () => {
      const response = await apiClient.get('/spirit/chat');
      return response.data;
    },
    sendMessage: async (message: string) => {
      const response = await apiClient.post('/spirit/chat', {
        message,
      });
      return response.data;
    },
    clearHistory: async () => {
      const response = await apiClient.delete('/spirit/chat');
      return response.data;
    },
  },

  // Lucid Dreaming API
  lucid: {
    getStatistics: async () => {
      const response = await apiClient.get('/lucid/statistics');
      return response.data;
    },
  },

  // Dream Art API
  dreamArt: {
    getAll: async () => {
      const response = await apiClient.get('/dreamart');
      return response.data;
    },

    upload: async (title: string, description: string, imageBase64: string) => {
      const response = await apiClient.post('/dreamart/upload', {
        title,
        description,
        imageBase64,
      });
      return response.data;
    },

    generate: async (prompt: string, style: string) => {
      const response = await apiClient.post('/dreamart/generate', {
        prompt,
        style,
      });
      return response.data;
    },

    delete: async (id: number) => {
      const response = await apiClient.delete(`/dreamart/${id}`);
      return response.data;
    },
  },

  // Friends API
  friends: {
    sendRequest: async (receiverId: string) => {
      const response = await apiClient.post(`/friends/request/${receiverId}`);
      return response.data;
    },

    acceptRequest: async (requestId: number) => {
      const response = await apiClient.post(`/friends/accept/${requestId}`);
      return response.data;
    },

    rejectRequest: async (requestId: number) => {
      const response = await apiClient.post(`/friends/reject/${requestId}`);
      return response.data;
    },

    cancelRequest: async (requestId: number) => {
      const response = await apiClient.delete(`/friends/request/${requestId}`);
      return response.data;
    },

    getFriends: async () => {
      const response = await apiClient.get('/friends');
      return response.data;
    },

    getSentRequests: async () => {
      const response = await apiClient.get('/friends/requests/sent');
      return response.data;
    },

    getReceivedRequests: async () => {
      const response = await apiClient.get('/friends/requests/received');
      return response.data;
    },

    checkStatus: async (otherUserId: string) => {
      const response = await apiClient.get(`/friends/status/${otherUserId}`);
      return response.data;
    },
  },
};

export default apiClient;
