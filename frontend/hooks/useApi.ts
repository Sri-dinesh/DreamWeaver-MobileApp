import { useState, useEffect } from 'react';
import { api } from '@/api/client';

// Generic API hook for data fetching with loading and error states
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('API Hook Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

// Specific hooks for different data types
export function useDreams(params?: { search?: string; page?: number }) {
  return useApi(() => api.dreams.getAll(params), [params]);
}

export function useDream(id: string) {
  return useApi(() => api.dreams.getById(id), [id]);
}

export function useAudioFiles(params?: { category?: string; search?: string }) {
  return useApi(() => api.audio.getAll(params), [params]);
}

export function useUserProfile() {
  return useApi(() => api.user.getProfile(), []);
}

export function useDreamStats() {
  return useApi(() => api.analytics.getDreamStats(), []);
}

export function useSleepPlans() {
  return useApi(() => api.sleep.getPlans(), []);
}

export function usePublicDreams(params?: { page?: number }) {
  return useApi(() => api.community.getPublicDreams(params), [params]);
}

export function useSharedDreams(visibility: 'public' | 'friends', params?: { page?: number }) {
  return useApi(() => api.dreams.getShared(visibility, params), [visibility, params]);
}

// Mutation hook for API calls that modify data
export function useApiMutation<T, P>(
  apiCall: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(params);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('API Mutation Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Specific mutation hooks
export function useCreateDream() {
  return useApiMutation(api.dreams.create);
}

export function useUpdateDream() {
  return useApiMutation(({ id, data }: { id: string; data: any }) => 
    api.dreams.update(id, data)
  );
}

export function useDeleteDream() {
  return useApiMutation(api.dreams.delete);
}

export function useAnalyzeDream() {
  return useApiMutation(api.ai.analyzeDream);
}

export function useUploadAudio() {
  return useApiMutation(api.audio.upload);
}

export function useGenerateAffirmation() {
  return useApiMutation(api.audio.generateAffirmation);
}

export function useGenerateBinaural() {
  return useApiMutation(api.audio.generateBinaural);
}

export function useGenerateSubliminal() {
  return useApiMutation(api.audio.generateSubliminal);
}

export function useAIChat() {
  return useApiMutation(({ message, conversationId }: { message: string; conversationId?: string }) =>
    api.ai.chat(message, conversationId)
  );
}

export function useGeneratePrompt() {
  return useApiMutation(({ type, theme }: { type: string; theme: string }) =>
    api.ai.generatePrompt(type, theme)
  );
}