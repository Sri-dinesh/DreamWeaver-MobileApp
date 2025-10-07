const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", 'Accept'],
    credentials: true, 
    preflightContinue: false,
    optionsSuccessStatus: 204 
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
const audiolibraryRoutes = require("./src/routes/audiolibrary.routes");
const sharedRoutes = require("./src/routes/shared.routes");

app.get("/", (req, res) => {
  res.json({ message: "Welcome to DreamWeaver backend." });
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
app.use("/api/audiolibrary", audiolibraryRoutes);
app.use("/api/shared", sharedRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
