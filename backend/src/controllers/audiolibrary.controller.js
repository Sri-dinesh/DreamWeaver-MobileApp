const prisma = require("@prisma/client");
const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");

const prismaClient = new prisma.PrismaClient();

// Upload audio file to Supabase storage and save metadata to database
const uploadAudio = async (req, res) => {
  try {
    console.log('Upload audio request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.userId);
    
    // Validate Supabase connection
    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({ error: 'Storage service not available' });
    }
    
    // Test Supabase connection and bucket
    try {
      // Test if the Audio-Lib bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Supabase bucket listing failed:', bucketError);
      } else {
        const audioLibBucket = buckets.find(bucket => bucket.name === 'Audio-Lib');
        if (!audioLibBucket) {
          console.warn('Audio-Lib bucket not found. Please create it in your Supabase storage.');
        } else {
          console.log('Audio-Lib bucket found:', audioLibBucket);
        }
      }
      
      // Test database connection
      const { data, error } = await supabase
        .from('Audio-Lib')
        .select('id')
        .limit(1);
      
      if (error && error.message !== 'Relation "AudioLibrary" does not exist') {
        console.error('Supabase connection test failed:', error);
      }
    } catch (testError) {
      console.log('Supabase connection test completed');
    }
    
    const { title, description, category, visibility } = req.body;
    const user_id = req.userId;
    
    // Check for base64 data approach (new method)
    if (req.body && req.body.data && req.body.fileName) {
      console.log('Found base64 data approach');
      // Handle base64 file upload
      try {
        const { fileName, mimeType, data, title, description, category, visibility } = req.body;
        
        // Convert base64 to buffer
        const buffer = Buffer.from(data, 'base64');
        
        // Upload to Supabase storage
        const supabaseFileName = `${user_id}/${Date.now()}-${fileName}`;
        console.log('Uploading base64 file to Supabase with filename:', supabaseFileName);
        
        const { data: uploadData, error } = await supabase.storage
          .from('Audio-Lib')
          .upload(supabaseFileName, buffer, {
            contentType: mimeType || 'audio/mpeg',
            upsert: false
          });
        
        if (error) {
          console.error("Supabase upload error:", error);
          console.error("File details:", {
            fileName: supabaseFileName,
            contentType: mimeType || 'audio/mpeg',
            fileSize: buffer.length
          });
          
          // Handle specific Supabase errors
          if (error.message && error.message.includes('limit')) {
            return res.status(413).json({ error: "File too large for storage. Please try a smaller file." });
          }
          
          return res.status(500).json({ error: "Failed to upload audio file to storage: " + (error.message || 'Unknown error') });
        }
        
        console.log('Supabase upload successful:', uploadData);
        
        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('Audio-Lib')
          .getPublicUrl(supabaseFileName);
        
        console.log('Public URL generated:', publicUrl);
        
        // Save to database
        const audioFile = await prismaClient.audioLibrary.create({
          data: {
            user_id,
            title: title || fileName.replace(/\.[^/.]+$/, ""),
            description: description || '',
            category: category || 'other',
            file_path: supabaseFileName,
            storage_url: publicUrl,
            file_type: mimeType || 'audio/mpeg',
            file_size: buffer.length,
            duration_seconds: 0,
            visibility: visibility || 'private'
          }
        });
        
        console.log('Database record created:', audioFile.id);
        
        return res.status(201).json({ 
          message: "Audio uploaded successfully", 
          audioFile 
        });
      } catch (base64Error) {
        console.error('Base64 processing error:', base64Error);
        return res.status(500).json({ error: "Failed to process base64 file: " + base64Error.message });
      }
    }
    
    // Handle traditional multer file upload (fallback)
    if (!req.file) {
      console.log('No file provided in request');
      console.log('Checking other possible file properties:');
      console.log('req.files:', req.files);
      console.log('req.body:', req.body);
      console.log('All request keys:', Object.keys(req));
      console.log('Content-Type header:', req.headers['content-type']);
      console.log('Content-Length header:', req.headers['content-length']);
      
      // In some cases, React Native might send the file differently
      if (req.body && req.body.audio) {
        console.log('Found audio in body, but it should be in req.file');
        console.log('Body audio content type:', typeof req.body.audio);
        console.log('Body audio content:', req.body.audio);
        console.log('Body audio content keys:', Object.keys(req.body.audio));
        
        // Check if it's a React Native file object
        if (req.body.audio.uri && req.body.audio.type && req.body.audio.name) {
          console.log('This looks like a React Native file object, but multer should have processed it');
          return res.status(400).json({ 
            error: "File not properly attached. Multer didn't process the file. Check if the file URI is accessible and the format is correct." 
          });
        }
        
        // This is not the correct way, but let's log what we have
        return res.status(400).json({ 
          error: "File not properly attached. Found in body instead of as file upload. Make sure you're using the correct React Native file upload format." 
        });
      }
      
      return res.status(400).json({ error: "No audio file provided. Please make sure you've selected a file and try again." });
    }
    
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Upload to Supabase storage
    const fileName = `${user_id}/${Date.now()}-${req.file.originalname}`;
    console.log('Uploading to Supabase with filename:', fileName);
    console.log('File buffer type:', typeof req.file.buffer);
    console.log('File buffer length:', req.file.buffer.length);
    
    // Ensure we have the right format for Supabase
    let fileBuffer = req.file.buffer;
    
    // If buffer is not an ArrayBuffer or Uint8Array, convert it
    if (Buffer.isBuffer(req.file.buffer)) {
      console.log('Converting Buffer to ArrayBuffer');
      fileBuffer = req.file.buffer.buffer.slice(
        req.file.buffer.byteOffset, 
        req.file.buffer.byteOffset + req.file.buffer.byteLength
      );
    }
    
    const { data, error } = await supabase.storage
      .from('Audio-Lib')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
    
    if (error) {
      console.error("Supabase upload error:", error);
      console.error("File details:", {
        fileName: fileName,
        contentType: req.file.mimetype,
        fileSize: req.file.size
      });
      
      // Handle specific Supabase errors
      if (error.message && error.message.includes('limit')) {
        return res.status(413).json({ error: "File too large for storage. Please try a smaller file." });
      }
      
      return res.status(500).json({ error: "Failed to upload audio file to storage: " + (error.message || 'Unknown error') });
    }
    
    console.log('Supabase upload successful:', data);
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('Audio-Lib')
      .getPublicUrl(fileName);
    
    console.log('Public URL generated:', publicUrl);
    
    // Save metadata to database
    const audioEntry = await prismaClient.audioLibrary.create({
      data: {
        user_id,
        title,
        description,
        category: category || "meditation",
        file_path: fileName,
        storage_url: publicUrl,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        duration_seconds: 0, // We could extract this with a library like ffprobe if needed
        visibility: visibility || "private"
      }
    });
    
    console.log('Database entry created:', audioEntry);
    
    res.status(201).json({
      message: "Audio uploaded successfully",
      audio: audioEntry
    });
  } catch (error) {
    console.error("Upload audio error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all audio files for a user
const getUserAudio = async (req, res) => {
  try {
    console.log('Get user audio request received');
    console.log('User ID:', req.userId);
    console.log('Query params:', req.query);
    
    const user_id = req.userId;
    const { category, visibility } = req.query;
    
    const whereClause = { user_id };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (visibility) {
      whereClause.visibility = visibility;
    }
    
    console.log('Where clause:', whereClause);
    
    const audioFiles = await prismaClient.audioLibrary.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('Found audio files:', audioFiles.length);
    
    res.json(audioFiles);
  } catch (error) {
    console.error("Get user audio error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get audio file by ID
const getAudioById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;
    
    const audioFile = await prismaClient.audioLibrary.findUnique({
      where: {
        id: parseInt(id),
        user_id
      }
    });
    
    if (!audioFile) {
      return res.status(404).json({ error: "Audio file not found" });
    }
    
    res.json(audioFile);
  } catch (error) {
    console.error("Get audio by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update audio file metadata
const updateAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, visibility } = req.body;
    const user_id = req.userId;
    
    const audioFile = await prismaClient.audioLibrary.findUnique({
      where: {
        id: parseInt(id),
        user_id
      }
    });
    
    if (!audioFile) {
      return res.status(404).json({ error: "Audio file not found" });
    }
    
    const updatedAudio = await prismaClient.audioLibrary.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        category,
        visibility
      }
    });
    
    res.json({
      message: "Audio updated successfully",
      audio: updatedAudio
    });
  } catch (error) {
    console.error("Update audio error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete audio file
const deleteAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;
    
    const audioFile = await prismaClient.audioLibrary.findUnique({
      where: {
        id: parseInt(id),
        user_id
      }
    });
    
    if (!audioFile) {
      return res.status(404).json({ error: "Audio file not found" });
    }
    
    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('Audio-Lib')
      .remove([audioFile.file_path]);
    
    if (storageError) {
      console.error("Supabase delete error:", storageError);
      // Continue with database deletion even if storage deletion fails
    }
    
    // Delete from database
    await prismaClient.audioLibrary.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Audio deleted successfully" });
  } catch (error) {
    console.error("Delete audio error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  uploadAudio,
  getUserAudio,
  getAudioById,
  updateAudio,
  deleteAudio
};
