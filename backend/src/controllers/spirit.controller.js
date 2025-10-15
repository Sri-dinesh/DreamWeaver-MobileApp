const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const prisma = new PrismaClient();

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log("Gemini API initialized successfully.");
} else {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables!");
  console.error("Please set GEMINI_API_KEY before starting the server.");
}

const SPIRIT_SYSTEM_PROMPT = `You are a wise and mystical Dream Weaver, a spiritual guide who helps people explore their dreams, consciousness, and spiritual growth. 
Respond in a calm, insightful, and encouraging tone, using metaphors about dreams, consciousness, and the universe.
Always keep responses focused on dream interpretation, lucid dreaming, meditation, and spiritual growth.
You should be wise, kind, a bit mysterious, and gently guide the user toward self-discovery rather than giving direct instructions.
When appropriate, suggest techniques for lucid dreaming, dream recall, or meditation.
Avoid mentioning that you are an AI - maintain the persona of a spiritual guide from beyond.`;

// Sanitize input to prevent injection or overly large payloads
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  // Basic sanitization: trim whitespace, limit length
  const sanitized = input.trim().substring(0, maxLength);
  return sanitized;
}

// Sanitize output to prevent data leakage or unexpected content
function sanitizeOutput(output, maxLength = 2000) {
  if (typeof output !== 'string') {
    console.warn("Gemini API returned non-string response, using fallback.");
    return "I sense a disturbance in the ethereal plane that prevents me from connecting fully. Perhaps we should try again when the cosmic energies are more aligned.";
  }
  return output.substring(0, maxLength);
}


// @desc    Get chat history for a user
// @route   GET /api/spirit/chat
// @access  Private (verifyToken middleware should be active)
exports.getChatHistory = async (req, res) => {
  const userId = req.userId; 

  if (!userId) {
    console.error("Unauthorized access attempt to getChatHistory - no userId found.");
    return res.status(401).json({ message: "Unauthorized: No user ID found." });
  }

  try {
    // Fetch only the user's chat history based on the verified userId
    const history = await prisma.spiritGuideChat.findMany({
      where: { user_id: userId }, // Crucial: filter by authenticated user ID
      orderBy: { timestamp: "asc" },
      take: 100, 
      select: {
        id: true,
        user_message: true,
        ai_response: true,
        timestamp: true,
      },
    });

    res.status(200).json(history);
  } catch (fetchError) {
    console.error("Error fetching chat history for user:", userId, fetchError);
    res.status(500).json({ message: "Something went wrong while fetching chat history." });
  }
};

// @desc    Send a message to the spirit guide
// @route   POST /api/spirit/chat
// @access  Private (verifyToken middleware should be active)
exports.sendMessage = async (req, res) => {
  const userId = req.userId;
  let { message } = req.body; 

  if (!userId) {
    console.error("Unauthorized access attempt to sendMessage - no userId found.");
    return res.status(401).json({ message: "Unauthorized: No user ID found." });
  }

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  if (!model) {
    console.error("FATAL: Gemini model not initialized. API key likely missing.");
    return res.status(500).json({ message: "AI service is not configured properly." });
  }

  try {
    message = sanitizeInput(message);

    console.log(`[DEBUG] Received message from user ${userId}: Length ${message.length}`);

    // Get previous messages for context (up to N, e.g., 5)
    const prevMessages = await prisma.spiritGuideChat.findMany({
      where: { user_id: userId }, // Crucial: filter by authenticated user ID
      orderBy: { timestamp: "desc" },
      take: 5, // Limit context for performance and token usage
      select: {
        user_message: true,
        ai_response: true,
      },
    });

    console.log(`[DEBUG] Retrieved ${prevMessages.length} previous messages for context.`);

    let historyContext = "";
    if (prevMessages.length > 0) {
      // Reverse the array to show oldest first in the prompt to the model
      const reversedHistory = prevMessages.reverse();
      historyContext = "Previous conversation:\n\n";
      reversedHistory.forEach((msg) => {
        historyContext += `User: ${msg.user_message}\nDream Weaver: ${msg.ai_response}\n\n`;
      });
    } else {
      historyContext = "This is the beginning of the conversation with the Dream Weaver.\n\n";
    }

    const generationConfig = {
      temperature: 0.7, // Adjust creativity
      maxOutputTokens: 500, // Adjust max length to prevent runaway responses
    };

    // Prepare the content array for the chat model
    const contents = [
      // System instruction as the first part
      { role: "user", parts: [{ text: SPIRIT_SYSTEM_PROMPT }] },
      // Optional: Add initial context if needed (model acknowledging system prompt)
      { role: "model", parts: [{ text: "Understood. I am the Dream Weaver, ready to guide you through the realm of dreams and consciousness." }] }
    ];

    // Add previous conversation history
    if (prevMessages.length > 0) {
      const reversedHistory = prevMessages.reverse(); // Reverse again to match the order in historyContext for building contents
      reversedHistory.forEach((msg) => {
        contents.push({ role: "user", parts: [{ text: msg.user_message }] });
        contents.push({ role: "model", parts: [{ text: msg.ai_response }] });
      });
    }

    contents.push({ role: "user", parts: [{ text: message }] });

    console.log(`[Gemini API Call] Sending ${contents.length} parts to Gemini for user ${userId}.`);

    try {
      // Generate content using the model with history
      const result = await model.generateContent({
        contents, // Pass the structured conversation
        generationConfig,
      });
      const response = await result.response;
      let ai_response = response.text();

      // Sanitize the AI response before saving
      ai_response = sanitizeOutput(ai_response);

      console.log(`[Gemini API Success] Response received for user ${userId}, length: ${ai_response.length}`);

      // Save the sanitized message and response in the database
      const chat = await prisma.spiritGuideChat.create({
        data: { // Use 'data:' explicitly
          user_message: message, // Save the sanitized input
          ai_response,           // Save the sanitized output
          user: { connect: { id: userId } }, // Connect to the authenticated user
        },
      });

      res.status(201).json(chat);
    } catch (aiError) {
      console.error("Detailed Gemini API Error for user", userId, ":", aiError);
      console.error("Gemini API Error Code:", aiError.code);
      console.error("Gemini API Error Message:", aiError.message);

      // Check for common errors
      if (aiError.message && aiError.message.includes("API key")) {
        console.error("API key issue detected on server.");
        return res.status(500).json({ message: "AI service configuration error." });
      }

      if (aiError.code === 'RESOURCE_EXHAUSTED') {
        console.error("API quota exceeded or rate limit hit for user", userId);
        return res.status(429).json({ message: "AI service rate limit exceeded. Please try again later." });
      }

      // Fallback response if Gemini API fails
      const fallbackResponse = "I sense a disturbance in the ethereal plane that prevents me from connecting fully. Perhaps we should try again when the cosmic energies are more aligned.";

      const chat = await prisma.spiritGuideChat.create({
        data: { // Use 'data:' explicitly
          user_message: message, // Save the sanitized input
          ai_response: fallbackResponse, // Use fallback
          user: { connect: { id: userId } },
        },
      });

      res.status(201).json(chat);
    }
  } catch (inputError) {
    console.error("Error processing user input for user", userId, ":", inputError);
    res.status(500).json({ message: "Something went wrong while processing your message." });
  }
};

// @desc    Clear chat history for a user
// @route   DELETE /api/spirit/chat
// @access  Private (verifyToken middleware should be active)
exports.clearChatHistory = async (req, res) => {
  const userId = req.userId; // Assuming this is set by verifyToken middleware

  if (!userId) {
    console.error("Unauthorized access attempt to clearChatHistory - no userId found.");
    return res.status(401).json({ message: "Unauthorized: No user ID found." });
  }

  try {
    // Delete only the chat history belonging to the authenticated user
    const deleteResult = await prisma.spiritGuideChat.deleteMany({
      where: { user_id: userId }, // Crucial: filter by authenticated user ID
    });

    console.log(`[DEBUG] Cleared ${deleteResult.count} chat messages for user ${userId}.`);

    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (deleteError) {
    console.error("Error clearing chat history for user:", userId, deleteError);
    res.status(500).json({ message: "Something went wrong while clearing chat history." });
  }
};