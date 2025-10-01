const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const prisma = new PrismaClient();

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/])[A-Za-z\d!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]{8,}$/;
  return passwordRegex.test(password);
};

const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
};

exports.register = async (req, res) => {
  try {
    const username = sanitizeInput(req.body.username);
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        message:
          "Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase and lowercase letters, numbers, and special characters",
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "P2002") {
      const target = error.meta?.target?.[0];
      if (target === "username") {
        return res.status(409).json({ message: "Username is already taken" });
      } else if (target === "email") {
        return res.status(409).json({ message: "Email is already registered" });
      } else {
        return res
          .status(409)
          .json({ message: "Username or email already exists" });
      }
    }

    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

exports.login = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    // Rate limiting (would need middleware implementation)
    // Check if this IP or user has made too many login attempts

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password_hash: true,
      },
    });

    const isPasswordCorrect = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Authentication failed. Please try again later." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;

    if (!username || !email || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase and lowercase letters, numbers, and special characters",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res
      .status(500)
      .json({ message: "Password reset failed. Please try again later." });
  }
};
