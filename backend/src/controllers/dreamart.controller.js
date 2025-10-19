const { PrismaClient } = require("@prisma/client");
const supabase = require("../config/supabase");
const axios = require("axios");
const prisma = new PrismaClient();

// @desc    Get all dream art for a user
// @route   GET /api/dreamart
// @access  Private
exports.getDreamArt = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("📷 Fetching dream art for user:", userId);

    // ✅ FIXED: Use correct model name 'dreamArt' (matches schema)
    const artworks = await prisma.dreamArt.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: "desc" },
    });

    console.log("✅ Retrieved", artworks.length, "artworks");
    res.status(200).json(artworks);
  } catch (error) {
    console.error("❌ Error fetching dream art:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Failed to fetch dream art",
      error: error.message,
    });
  }
};

// @desc    Upload dream art from device
// @route   POST /api/dreamart/upload
// @access  Private
exports.uploadDreamArt = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, imageBase64 } = req.body;

    console.log("📤 Uploading dream art...");
    console.log("Received data:", {
      userId,
      title,
      hasDescription: !!description,
      imageBase64Length: imageBase64?.length || 0,
    });

    if (!imageBase64) {
      console.error("❌ No image base64 provided");
      return res.status(400).json({ message: "Image data is required" });
    }

    if (!title || !title.trim()) {
      console.error("❌ No title provided");
      return res.status(400).json({ message: "Title is required" });
    }

    console.log("Title:", title);
    console.log("User:", userId);
    console.log("Image base64 size:", imageBase64.length, "bytes");

    // Validate image size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (imageBase64.length > maxSize) {
      console.error("❌ Image exceeds max size");
      return res.status(413).json({
        message: "Image is too large. Maximum size is 50MB.",
      });
    }

    // Convert base64 to buffer
    let buffer;
    try {
      // ✅ FIX: Check if base64 has data URI prefix (data:image/...)
      const base64Data = imageBase64.includes("base64,")
        ? imageBase64.split("base64,")[1] // Extract after 'base64,'
        : imageBase64; // Use as-is if no prefix

      buffer = Buffer.from(base64Data, "base64");
      console.log("📦 Buffer created:", buffer.length, "bytes");

      if (buffer.length > maxSize) {
        console.error("❌ Actual image data exceeds max size");
        return res.status(413).json({
          message: "Image is too large. Maximum size is 50MB.",
        });
      }
    } catch (bufferError) {
      console.error("❌ Error converting base64:", bufferError);
      return res.status(400).json({ message: "Invalid image data format" });
    }

    // Generate unique filename
    const fileName = `${userId}/uploaded/${Date.now()}-${title
      .toLowerCase()
      .replace(/\s+/g, "-")}.png`;

    console.log("📝 Uploading to Supabase...");
    console.log("File path:", fileName);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from("Dream-Art")
      .upload(fileName, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase upload error:", error);

      if (error.message?.includes("Payload too large")) {
        return res.status(413).json({
          message: "Image is too large for storage.",
        });
      }

      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("✅ Upload successful");

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("Dream-Art")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log("🔗 Public URL:", publicUrl);

    // Save to database
    console.log("💾 Saving to database...");

    // ✅ FIXED: Use correct Prisma model
    const artwork = await prisma.dreamArt.create({
      data: {
        user_id: userId,
        prompt: title,
        image_url: publicUrl,
        description: description || null,
        timestamp: new Date(),
      },
    });

    console.log("✅ Artwork saved to database:", artwork.id);

    res.status(201).json({
      id: artwork.id,
      title: artwork.prompt,
      description: artwork.description,
      imageUrl: artwork.image_url,
      type: "Uploaded",
      timestamp: artwork.timestamp,
    });
  } catch (error) {
    console.error("❌ Error uploading dream art:", error);
    console.error("Full error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      message: "Failed to upload dream art",
      error: error.message,
    });
  }
};

// @desc    Generate AI dream art using Chutes.ai
// @route   POST /api/dreamart/generate
// @access  Private
exports.generateDreamArt = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt, style = "dreamlike" } = req.body;

    console.log("🎨 Generating AI dream art using Chutes.ai...");
    console.log("Request ", { userId, prompt, style });

    if (!prompt || !prompt.trim()) {
      console.error("❌ No prompt provided");
      return res.status(400).json({ message: "Prompt is required" });
    }

    console.log("Prompt:", prompt);
    console.log("Style:", style);
    console.log("API Key available:", !!process.env.CHUTES_API_KEY);

    // Validate API key
    if (!process.env.CHUTES_API_KEY) {
      console.error("❌ CHUTES_API_KEY not set in environment");
      return res.status(500).json({
        message: "Image generation service not configured",
        error: "API key missing",
      });
    }

    // Build the full prompt with style
    const fullPrompt = `${prompt}, ${style} art style, dreamlike, surreal, high quality, detailed, vibrant colors`;
    const negativePrompt =
      "blur, distortion, low quality, amateur, watermark, text";

    console.log("📡 Calling Chutes.ai API...");
    console.log("Full prompt:", fullPrompt);

    // Call Chutes.ai API - Get response as binary buffer
    const chutesResponse = await axios.post(
      "https://image.chutes.ai/generate",
      {
        model: "chroma",
        prompt: fullPrompt,
        negative_prompt: negativePrompt,
        guidance_scale: 7.5,
        width: 1024,
        height: 1024,
        num_inference_steps: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHUTES_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: 'arraybuffer', // Get binary data directly
        timeout: 300000,
      }
    );

    console.log("✅ Chutes.ai response received");
    console.log("Response status:", chutesResponse.status);
    console.log("Response type:", typeof chutesResponse.data);
    console.log("Response size:", chutesResponse.data.length, "bytes");

    // The response is already a binary buffer (PNG format)
    const imageBuffer = Buffer.from(chutesResponse.data);
    console.log("📦 Image buffer created:", imageBuffer.length, "bytes");

    // Upload to Supabase
    console.log("📤 Uploading to Supabase...");

    const fileName = `${userId}/generated/${Date.now()}-${prompt
      .toLowerCase()
      .slice(0, 30)
      .replace(/\s+/g, "-")}.png`;

    console.log("File path:", fileName);

    const { data, error } = await supabase.storage
      .from("Dream-Art")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase upload error:", error);
      return res.status(500).json({
        message: "Failed to upload generated image to storage",
        error: error.message,
      });
    }

    console.log("✅ Upload to Supabase successful");

    // Get public URL - ✅ FIXED
    let publicUrl;
    try {
      const { data: urlData } = supabase.storage
        .from("Dream-Art")
        .getPublicUrl(fileName);
        
      // Handle different response formats
      if (urlData && urlData.publicUrl) {
        publicUrl = urlData.publicUrl;
      } else if (urlData && urlData.data && urlData.data.publicUrl) {
        publicUrl = urlData.data.publicUrl; // Newer Supabase format
      } else {
        console.error("❌ Could not get public URL:", urlData);
        return res.status(500).json({
          message: "Could not retrieve public URL for image",
          error: "URL retrieval failed"
        });
      }
    } catch (urlError) {
      console.error("❌ Error getting public URL:", urlError);
      return res.status(500).json({
        message: "Could not retrieve public URL for image",
        error: urlError.message
      });
    }

    console.log("🔗 Public URL:", publicUrl);

    // Save to database
    console.log("💾 Saving to database...");

    const artwork = await prisma.dreamArt.create({
      data: {
        user_id: userId,
        prompt: prompt,
        image_url: publicUrl,
        description: `Generated with AI (${style} style)`,
        timestamp: new Date(),
      },
    });

    console.log("✅ Artwork saved to database:", artwork.id);

    res.status(201).json({
      id: artwork.id,
      title: artwork.prompt,
      description: artwork.description,
      imageUrl: artwork.image_url,
      type: "Generated",
      timestamp: artwork.timestamp,
    });
  } catch (error) {
    console.error("❌ Error generating dream art:", error);
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      code: error.code,
    });

    // Provide user-friendly error messages
    let errorMessage = "Failed to generate dream art";
    let statusCode = 500;

    if (error.code === "ECONNABORTED") {
      errorMessage = "Image generation timed out. Please try again.";
    } else if (error.response?.status === 401) {
      errorMessage = "API authentication failed. Check configuration.";
    } else if (error.response?.status === 429) {
      errorMessage = "Rate limit exceeded. Wait a moment and try again.";
      statusCode = 429;
    } else if (error.response?.status === 400) {
      errorMessage =
        error.response?.data?.error ||
        "Invalid prompt. Try with different text.";
      statusCode = 400;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Generation took too long. Try a simpler prompt.";
    }

    res.status(statusCode).json({
      message: errorMessage,
      error: error.message,
    });
  }
};

// @desc    Delete dream art
// @route   DELETE /api/dreamart/:id
// @access  Private
exports.deleteDreamArt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log("🗑️  Deleting dream art:", id);

    // ✅ FIXED: Use correct Prisma model
    const artwork = await prisma.dreamArt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    if (artwork.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this artwork" });
    }

    // Delete from Supabase
    if (artwork.image_url) {
      try {
        const urlParts = artwork.image_url.split("/Dream-Art/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];

          const { error } = await supabase.storage
            .from("Dream-Art")
            .remove([filePath]);

          if (error) {
            console.warn("⚠️  Error deleting from Supabase:", error);
          } else {
            console.log("✅ Image deleted from Supabase");
          }
        }
      } catch (storageError) {
        console.error("⚠️  Error processing Supabase deletion:", storageError);
      }
    }

    // Delete from database - ✅ FIXED
    await prisma.dreamArt.delete({
      where: { id: parseInt(id) },
    });

    console.log("✅ Artwork deleted from database");

    res.status(200).json({ message: "Artwork deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting artwork:", error);
    res.status(500).json({
      message: "Failed to delete artwork",
      error: error.message,
    });
  }
};
