import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface SleepPlan {
  id?: number;
  user_id?: string;
  plan_date: string;
  goal: string;
  bedtime_ritual?: string | null;
  ai_ritual_suggestion?: string | null;
  sleep_time?: string | null;
  wake_time?: string | null;
}

// Get authentication token
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

// Function to get headers with authorization
const getAuthHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Get all sleep plans for the current user
export const getSleepPlans = async (): Promise<SleepPlan[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/sleep/plans`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching sleep plans:', error);
    throw error;
  }
};

// Get a specific sleep plan by date
export const getSleepPlanByDate = async (date: string): Promise<SleepPlan> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/sleep/plans/${date}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching sleep plan for date ${date}:`, error);
    throw error;
  }
};

// Create or update a sleep plan
export const createOrUpdateSleepPlan = async (
  plan: SleepPlan
): Promise<SleepPlan> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/sleep/plans`, plan, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating/updating sleep plan:', error);
    throw error;
  }
};

// Delete a sleep plan
export const deleteSleepPlan = async (id: number): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/api/sleep/plans/${id}`, { headers });
  } catch (error) {
    console.error(`Error deleting sleep plan ${id}:`, error);
    throw error;
  }
};

// Generate a sleep ritual using AI
export const generateSleepRitual = async (
  goal: string,
  planDate?: string
): Promise<string> => {
  try {
    const headers = await getAuthHeaders();
    const payload = planDate ? { goal, plan_date: planDate } : { goal };

    const response = await axios.post(
      `${API_URL}/api/sleep/generate-ritual`,
      payload,
      { headers }
    );
    return response.data.ritual;
  } catch (error) {
    console.error('Error generating sleep ritual:', error);
    throw error;
  }
};

// Add a search function
export interface SleepPlanSearchParams {
  query?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const searchSleepPlans = async (
  params: SleepPlanSearchParams
): Promise<SleepPlan[]> => {
  try {
    const headers = await getAuthHeaders();

    // Build query string from parameters
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_URL}/api/sleep/search?${queryParams.toString()}`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error searching sleep plans:', error);
    throw error;
  }
};
