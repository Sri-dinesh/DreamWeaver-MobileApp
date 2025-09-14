
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get chat history for a user
// @route   GET /api/spirit/chat
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const history = await prisma.spiritGuideChat.findMany({
      where: { user_id: req.userId },
      orderBy: { timestamp: 'asc' },
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Send a message to the spirit guide
// @route   POST /api/spirit/chat
// @access  Private
exports.sendMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a wise and mystical spirit guide. A user is seeking your guidance. User's message: "${message}". Respond in a calm, insightful, and encouraging tone.`
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const ai_response = response.text();

    const chat = await prisma.spiritGuideChat.create({
      data: {
        user_message: message,
        ai_response,
        user: { connect: { id: req.userId } },
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// @desc    Clear chat history for a user
// @route   DELETE /api/spirit/chat
// @access  Private
exports.clearChatHistory = async (req, res) => {
  try {
    await prisma.spiritGuideChat.deleteMany({
      where: { user_id: req.userId },
    });
    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
