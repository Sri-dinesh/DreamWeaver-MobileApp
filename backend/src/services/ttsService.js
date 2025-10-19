const fs = require("fs");
const path = require("path");
const say = require("say");
const supabase = require("../config/supabase");

/**
 * Convert text to speech using 'say' package
 * Uploads to Supabase Storage bucket
 */
exports.convertTextToSpeech = async (text, userId, type = "affirmation") => {
  const tempDir = path.join(__dirname, "../../temp");
  const fileName = `${Date.now()}-${type}`;
  const tempFilePath = path.join(tempDir, `${fileName}.wav`);

  try {
    console.log("🎤 Starting TTS conversion with 'say' package...");
    console.log("Text length:", text.length);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("📁 Created temp directory");
    }

    // Generate audio using 'say'
    console.log("📝 Generating speech audio...");

    await new Promise((resolve, reject) => {
      say.export(text, null, 1.0, tempFilePath, (err) => {
        if (err) {
          console.error("❌ Say.js error:", err);
          reject(err);
        } else {
          console.log("✅ Audio generated successfully");
          resolve();
        }
      });
    });

    // Check if file was created
    if (!fs.existsSync(tempFilePath)) {
      throw new Error("Audio file was not created");
    }

    const stats = fs.statSync(tempFilePath);
    console.log("📦 Audio file size:", stats.size, "bytes");

    // Read the audio file as buffer
    const audioBuffer = fs.readFileSync(tempFilePath);
    console.log("✅ Audio buffer created:", audioBuffer.length, "bytes");

    // Generate Supabase file path
    const supabaseFileName = `${userId}/${type}/${Date.now()}.wav`;
    console.log("📤 Uploading to Supabase Storage...");
    console.log("Bucket: Audio-Lib");
    console.log("File path:", supabaseFileName);

    if (!supabase) {
      throw new Error("Supabase not initialized");
    }

    // Upload file to Supabase
    console.log("📨 Sending upload request to Supabase...");

    const { data, error } = await supabase.storage
      .from("Audio-Lib")
      .upload(supabaseFileName, audioBuffer, {
        contentType: "audio/wav",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase upload failed");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    console.log("✅ Upload successful");
    console.log("Upload response:", data);

    // Get public URL - IMPORTANT: Use the correct format
    console.log("🔗 Generating public URL...");

    const { data: urlData } = supabase.storage
      .from("Audio-Lib")
      .getPublicUrl(supabaseFileName);

    let publicUrl = urlData.publicUrl;

    // Fix the URL format if needed
    // Supabase returns: https://rbxlyxnmqzytuhyijprq.supabase.co/storage/v1/object/public/Audio-Library/...
    // This is the CORRECT format for public access

    console.log("✅ Public URL generated:", publicUrl);
    console.log("URL breakdown:");
    console.log("  - Domain:", publicUrl.split("/")[2]);
    console.log("  - Path:", publicUrl.split("/storage")[1]?.substring(0, 50));

    // Cleanup temp file
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log("🧹 Temp file cleaned up");
      }
    } catch (cleanupError) {
      console.warn("⚠️  Cleanup warning:", cleanupError.message);
    }

    return {
      audioUrl: publicUrl,
      fileName: supabaseFileName,
      size: audioBuffer.length,
      type: type,
    };
  } catch (error) {
    console.error("❌ TTS Service Error:", error.message);

    // Cleanup on error
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.warn("Cleanup error:", cleanupError);
    }

    throw error;
  }
};

/**
 * Delete audio file from Supabase Storage
 */
exports.deleteAudioFile = async (filePath) => {
  try {
    console.log("🗑️  Deleting audio file from Supabase:", filePath);

    if (!supabase) {
      throw new Error("Supabase not initialized");
    }

    // Extract just the file path without the full URL if needed
    let cleanPath = filePath;
    if (filePath.includes("/storage/v1/object/public/Audio-Lib/")) {
      cleanPath = filePath.split("/Audio-Lib/")[1];
    }

    console.log("Clean path for deletion:", cleanPath);

    const { error } = await supabase.storage
      .from("Audio-Lib")
      .remove([cleanPath]);

    if (error) {
      console.error("❌ Delete error:", error);
      throw new Error(`Failed to delete audio: ${error.message}`);
    }

    console.log("✅ File deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    throw error;
  }
};
