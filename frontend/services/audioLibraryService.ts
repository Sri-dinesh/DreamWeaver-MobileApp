import apiClient from '@/api/client';

// Audio Library Service
export const audioLibraryService = {
  // Upload audio file
  uploadAudio: async (formData: FormData) => {
    try {
      const response = await apiClient.post('/api/audio-library/upload', formData);
      return response.data;
    } catch (error: any) {
      console.error('Upload audio error:', error);
      
      // Provide more specific error messages
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Upload failed';
        throw new Error(`Upload failed: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Upload failed');
      }
    }
  },

  // Get user's audio files
  getUserAudio: async (params?: { category?: string; visibility?: string }) => {
    try {
      const response = await apiClient.get('/api/audio-library', { params });
      return response.data;
    } catch (error) {
      console.error('Get user audio error:', error);
      throw error;
    }
  },

  // Get audio file by ID
  getAudioById: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/audio-library/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get audio by ID error:', error);
      throw error;
    }
  },

  // Update audio file metadata
  updateAudio: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/api/audio-library/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update audio error:', error);
      throw error;
    }
  },

  // Delete audio file
  deleteAudio: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/audio-library/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete audio error:', error);
      throw error;
    }
  },

  // Get public audio files from Music folder
  getPublicAudioFiles: async () => {
    try {
      const response = await apiClient.get('/api/public-audio/public');
      return response.data;
    } catch (error) {
      console.error('Get public audio error:', error);
      throw error;
    }
  },
};
