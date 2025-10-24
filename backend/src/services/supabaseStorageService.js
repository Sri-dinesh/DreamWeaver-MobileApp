const supabase = require('../config/supabase');

class SupabaseStorageService {
  constructor() {
    this.bucketName = 'Audio-Lib';
  }

  // Check if Supabase is configured
  isConfigured() {
    return !!supabase;
  }

  // Upload file to Supabase storage
  async uploadFile(fileBuffer, fileName, fileType = 'audio/wav') {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ Supabase not configured, skipping upload');
        return null;
      }

      console.log(`📤 Uploading ${fileName} to Supabase...`);

      // Create file path with user context if available
      const filePath = `audio-generators/${fileName}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileBuffer, {
          contentType: fileType,
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        return null;
      }

      console.log('✅ File uploaded to Supabase:', filePath);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        publicUrl: publicUrlData.publicUrl,
        fileName,
      };
    } catch (error) {
      console.error('❌ Error uploading to Supabase:', error);
      return null;
    }
  }

  // Delete file from Supabase storage
  async deleteFile(filePath) {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ Supabase not configured, skipping delete');
        return false;
      }

      console.log(`🗑️ Deleting ${filePath} from Supabase...`);

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        return false;
      }

      console.log('✅ File deleted from Supabase:', filePath);
      return true;
    } catch (error) {
      console.error('❌ Error deleting from Supabase:', error);
      return false;
    }
  }

  // Get public URL for a file
  getPublicUrl(filePath) {
    if (!this.isConfigured()) {
      return null;
    }

    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // List files in bucket
  async listFiles(prefix = 'audio-generators/') {
    try {
      if (!this.isConfigured()) {
        console.warn('⚠️ Supabase not configured, cannot list files');
        return [];
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(prefix);

      if (error) {
        console.error('❌ Error listing files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in listFiles:', error);
      return [];
    }
  }
}

module.exports = new SupabaseStorageService();
