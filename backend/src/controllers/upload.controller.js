const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// @desc    Upload profile photo to Supabase
// @route   POST /api/upload/profile-photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}.jpg`;
    const bucketName = "Profile-Photo";

    // Read file from multer
    const fileBuffer = req.file.buffer;
    const filePath = `${userId}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({
        message: "Failed to upload file to storage",
        error: error.message,
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const photoUrl = publicUrlData.publicUrl;

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profile_picture_url: photoUrl,
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profile_picture_url: true,
      },
    });

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      url: photoUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
