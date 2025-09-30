const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { HfInference } = require("@huggingface/inference");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js"); // Add this

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Use environment variable for API token instead of hardcoding
const hf = new HfInference(process.env.HF_TOKEN);

// @desc    Get all dream art for a user
// @route   GET /api/dreamart
// @access  Private
exports.getDreamArt = async (req, res) => {
  try {
    const art = await prisma.dreamArt.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json(art);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Upload a new dream art
// @route   POST /api/dreamart
// @access  Private
exports.uploadDreamArt = async (req, res) => {
  const { prompt, description } = req.body;
  const image_url = req.file ? `/images/${req.file.filename}` : null;

  if (!prompt || !image_url) {
    return res.status(400).json({ message: "Prompt and image are required" });
  }

  try {
    const art = await prisma.dreamArt.create({
      data: {
        prompt,
        description,
        image_url,
        user: { connect: { id: req.userId } },
      },
    });
    res.status(201).json(art);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Delete a dream art
// @route   DELETE /api/dreamart/:id
// @access  Private
exports.deleteDreamArt = async (req, res) => {
  const { id } = req.params;

  try {
    const art = await prisma.dreamArt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!art) {
      return res.status(404).json({ message: "Dream art not found" });
    }

    if (art.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, `../../public${art.image_url}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.dreamArt.delete({
      where: { id: parseInt(id) },
    });

    // Success response after deletion
    res.status(200).json({ message: "Dream art deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// @desc    Generate dream art using AI
// @route   POST /api/dreamart/generate
// @access  Private
exports.generateDreamArt = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    // Generate more secure filename with random component
    const randomString = crypto.randomBytes(8).toString("hex");
    const filename = `${Date.now()}_${randomString}.jpg`;

    // Generate image using Hugging Face
    const imageBlob = await hf.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
      parameters: {
        negative_prompt: "blurry, distorted, low quality, ugly, bad anatomy",
        guidance_scale: 7.5,
      },
    });

    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

    const { data, error } = await supabase.storage
      .from("dreamArtImages") // Your bucket name in Supabase
      .upload(`public/${filename}`, imageBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({
        message: "Failed to upload image to storage",
        error: error.message,
      });
    }

    const { data: urlData } = supabase.storage
      .from("dreamArtImages")
      .getPublicUrl(`public/${filename}`);

    const imageUrl = urlData.publicUrl;

    const art = await prisma.dreamArt.create({
      data: {
        prompt,
        image_url: imageUrl, // Store the full Supabase URL
        user: { connect: { id: req.userId } },
      },
    });

    res.status(201).json({
      message: "Image generated successfully",
      image_url: imageUrl,
      prompt: prompt,
      id: art.id,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      message: "Image generation failed",
      error: error.message,
    });
  }
};

// @desc    Delete a dream art
// @route   DELETE /api/dreamart/:id
// @access  Private
exports.deleteDreamArt = async (req, res) => {
  const { id } = req.params;

  try {
    const art = await prisma.dreamArt.findUnique({
      where: { id: parseInt(id) },
    });

    if (!art) {
      return res.status(404).json({ message: "Dream art not found" });
    }

    if (art.user_id !== req.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    if (art.image_url && art.image_url.includes("supabase")) {
      try {
        const urlParts = art.image_url.split("/");
        const filename = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];
        const filePath = `${folderName}/${filename}`;

        console.log(
          `Attempting to delete file: ${filePath} from Supabase storage`
        );

        const { error } = await supabase.storage
          .from("dreamArtImages")
          .remove([filePath]);

        if (error) {
          console.error("Failed to delete image from Supabase:", error);
        } else {
          console.log("Successfully deleted image from Supabase storage");
        }
      } catch (storageError) {
        console.error(
          "Error while trying to delete from storage:",
          storageError
        );
      }
    } else if (art.image_url && art.image_url.startsWith("/images/")) {
      const filePath = path.join(__dirname, `../../public${art.image_url}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted local file: ${filePath}`);
      }
    }

    await prisma.dreamArt.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Dream art deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting dream art:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete dream art",
      error: error.message,
    });
  }
};
