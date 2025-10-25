const supabase = require("../config/supabase");

// Get public audio files from the "Music" folder in Supabase storage
const getPublicAudioFiles = async (req, res) => {
  try {
    // console.log('Get public audio files request received');
    
    // List all files in the "Music" folder
    const { data: files, error } = await supabase.storage
      .from('Audio-Lib')
      .list('Music/', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Supabase list files error:', error);
      return res.status(500).json({ error: 'Failed to fetch public audio files' });
    }
    
    // console.log('Found public audio files:', files?.length || 0);
    
    // If no files found, return empty array
    if (!files || files.length === 0) {
      return res.json([]);
    }
    
    // Process the files to create audio objects similar to database entries
    const publicAudioFiles = files
      .filter(file => file.name && !file.name.endsWith('/')) // Filter out folders
      .map(file => {
        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('Audio-Lib')
          .getPublicUrl(`Music/${file.name}`);
        
        return {
          id: `public_${file.id || file.name}`,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
          description: 'Public audio file',
          category: 'music',
          file_path: `Music/${file.name}`,
          storage_url: publicUrl,
          file_type: file.metadata?.mimetype || 'audio/mpeg',
          file_size: file.metadata?.size || 0,
          duration_seconds: 0,
          visibility: 'public',
          created_at: file.created_at || new Date().toISOString(),
          is_public: true // Flag to distinguish public files
        };
      });
    
    res.json(publicAudioFiles);
  } catch (error) {
    console.error('Get public audio files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPublicAudioFiles
};
