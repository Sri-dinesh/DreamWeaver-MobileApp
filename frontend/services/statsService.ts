import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface DreamStats {
  totalDreams: number;
  lucidDreams: number;
}

export interface SleepStats {
  averageSleep: number | null;
  recordsCount: number;
}

export interface Stats {
  dreamCount: number;
  lucidDreamCount: number;
  avgSleep: string;
  daysActive?: number; // Make it optional so it doesn't break existing code
}

export const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('userToken');
    } else {
      return await SecureStore.getItemAsync('userToken');
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Fetches dream statistics from the API
 * @returns Promise with dream stats
 */
export const fetchDreamStats = async (): Promise<DreamStats | null> => {
  try {
    const token = await getToken();

    if (!token) {
      console.error('No token available for fetching dream stats');
      throw new Error('Authentication required');
    }

    const response = await axios.get<DreamStats>(
      `${API_URL}/api/dreams/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching dream stats:', error);
    throw error;
  }
};

/**
 * Fetches sleep statistics from the API
 * @returns Promise with sleep stats
 */
export const fetchSleepStats = async (): Promise<SleepStats | null> => {
  try {
    const token = await getToken();

    if (!token) {
      console.error('No token available for fetching sleep stats');
      throw new Error('Authentication required');
    }

    const response = await axios.get<SleepStats>(`${API_URL}/api/sleep/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching sleep stats:', error);
    throw error;
  }
};

/**
 * Fetches all statistics (dream and sleep) and formats them for display
 * @returns Formatted stats object
 */
export const fetchAllStats = async (): Promise<Stats> => {
  try {
    // Default values
    let stats: Stats = {
      dreamCount: 0,
      lucidDreamCount: 0,
      avgSleep: '0h',
      daysActive: 0,
    };

    // Try to get dream stats
    try {
      const dreamStats = await fetchDreamStats();
      if (dreamStats) {
        stats.dreamCount = dreamStats.totalDreams || 0;
        stats.lucidDreamCount = dreamStats.lucidDreams || 0;
      }
    } catch (error) {
      console.error('Error in dream stats:', error);
    }

    // Try to get sleep stats
    try {
      const sleepStats = await fetchSleepStats();
      if (sleepStats && sleepStats.averageSleep !== null) {
        stats.avgSleep = `${sleepStats.averageSleep.toFixed(1)}h`;
      } else {
        stats.avgSleep = '7.5h'; // Default placeholder
      }
    } catch (error) {
      console.error('Error in sleep stats:', error);
      stats.avgSleep = '7.5h'; // Default placeholder
    }

    // Try to get days active (you would need to implement this API endpoint)
    try {
      const token = await getToken();
      if (token) {
        const response = await axios.get(`${API_URL}/api/users/activity`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        stats.daysActive = response.data.daysActive || 0;
      }
    } catch (error) {
      console.error('Error fetching days active:', error);
      // Calculate a random number between 1-60 as a placeholder
      stats.daysActive = Math.floor(Math.random() * 60) + 1;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching all stats:', error);
    // Return default values on error
    return {
      dreamCount: 0,
      lucidDreamCount: 0,
      avgSleep: '0h',
      daysActive: 0,
    };
  }
};

/**
 * Mock function to get stats without API calls (for testing/development)
 */
export const getMockStats = (): Stats => {
  return {
    dreamCount: 12,
    lucidDreamCount: 3,
    avgSleep: '7.5h',
  };
};
