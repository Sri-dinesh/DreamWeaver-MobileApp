import { api } from '@/api/client';

// Types for analytics data
interface DreamEntry {
  emotion: string;
  timestamp: string;
}

interface EmotionalSleepMapResponse {
  message?: string;
  [key: string]: any; // For array responses
}

interface EmotionDistribution {
  emotion: string;
  percentage: number;
}

interface SleepDurationEntry {
  date: string;
  duration: number;
}

interface LucidDreamEntry {
  date: string;
  count: number;
}

interface CorrelationResponse {
  correlation: number;
  message?: string;
}

interface DreamConsistencyResponse {
  consistency: number;
  message?: string;
}

// Service functions
export const analyticsService = {
  // Fetch emotional sleep map data
  getEmotionalSleepMap: async (): Promise<DreamEntry[]> => {
    try {
      const response = await api.analytics.getEmotionalSleepMap();
      // The API client now ensures we always get an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching emotional sleep map:', error);
      return [];
    }
  },

  // Fetch dream emotions distribution
  getDreamEmotionsDistribution: async (): Promise<EmotionDistribution[]> => {
    try {
      const response = await api.analytics.getDreamEmotionsDistribution();
      // The API client now ensures we always get an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching dream emotions distribution:', error);
      return [];
    }
  },

  // Fetch sleep duration data
  getSleepDuration: async (): Promise<SleepDurationEntry[]> => {
    try {
      const response = await api.analytics.getSleepDuration();
      // The API client now ensures we always get an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching sleep duration:', error);
      return [];
    }
  },

  // Fetch lucid dreams data
  getLucidDreamsPerDay: async (): Promise<LucidDreamEntry[]> => {
    try {
      const response = await api.analytics.getLucidDreamsPerDay();
      // The API client now ensures we always get an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching lucid dreams:', error);
      return [];
    }
  },

  // Fetch sleep & dream correlations
  getSleepDreamCorrelations: async (): Promise<CorrelationResponse> => {
    try {
      const response = await api.analytics.getSleepDreamCorrelations();
      // The API client now ensures we always get a proper correlation object
      if (response && typeof response === 'object' && 'correlation' in response) {
        return response as CorrelationResponse;
      }
      return { correlation: 0, message: 'No correlation data available' };
    } catch (error) {
      console.error('Error fetching correlations:', error);
      return { correlation: 0, message: 'Failed to fetch correlation data' };
    }
  },

  // Fetch dream consistency data
  getDreamConsistency: async (): Promise<DreamConsistencyResponse> => {
    try {
      const response = await api.analytics.getDreamConsistency();
      // The API client now ensures we always get a proper consistency object
      if (response && typeof response === 'object' && 'consistency' in response) {
        return response as DreamConsistencyResponse;
      }
      return { consistency: 0, message: 'No consistency data available' };
    } catch (error) {
      console.error('Error fetching dream consistency:', error);
      return { consistency: 0, message: 'Failed to fetch dream consistency data' };
    }
  }
};
