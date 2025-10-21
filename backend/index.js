const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "development")
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

const authRoutes = require("./src/routes/auth.routes");
const dreamRoutes = require("./src/routes/dream.routes");
const aiRoutes = require("./src/routes/ai.routes");
const sleepRoutes = require("./src/routes/sleep.routes");
const userRoutes = require("./src/routes/user.routes");
const friendRoutes = require("./src/routes/friend.routes");
const lucidRoutes = require("./src/routes/lucid.routes");
const spiritRoutes = require("./src/routes/spirit.routes");
const dreamartRoutes = require("./src/routes/dreamart.routes");
const sleeprecordingRoutes = require("./src/routes/sleeprecording.routes");
const analyticsRoutes = require("./src/routes/analytics.routes");
const sharedRoutes = require("./src/routes/shared.routes");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the DreamWeaver Backend API" });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dreams", dreamRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/lucid", lucidRoutes);
app.use("/api/spirit", spiritRoutes);
app.use("/api/dreamart", dreamartRoutes);
app.use("/api/recordings", sleeprecordingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/shared", sharedRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

app.use((error, req, res, next) => {
  console.error("❌ Global Error Handler:", error);
  const statusCode = error.statusCode || 500;
  const message =
    error.message || "An unexpected internal server error occurred.";
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
  });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`\n✅ DreamWeaver Backend Server (Development)`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
