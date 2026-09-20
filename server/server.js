const express = require("express");
const cors = require("cors");

const rateLimit = require("express-rate-limit");

const env = require('./config/env.js');

const { connectDB } = require("./config/db.js");
const { loadVillages } = require("./services/villageService.js");

const healthRoutes = require("./routes/healthRoutes.js");
const villageRoutes = require("./routes/villageRoutes.js");
const weatherRoutes = require("./routes/weatherRoutes.js");
const recommendationRoutes = require("./routes/recommendationRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");
const satelliteRoutes = require("./routes/satelliteRoutes.js");
const scoreRoutes = require("./routes/scoreRoutes.js");
const farmRoutes = require("./routes/farmRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");
const analysisRoutes = require("./routes/analysisRoutes.js");
const historyRoutes = require("./routes/historyRoutes.js");

const app = express();
const PORT = env.PORT;
const allowedOrigins = (env.ALLOWED_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS setup
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));

// Basic Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Rate limit exceeded. Please try again in a minute." },
});

app.use("/api/v1", limiter);

// Mount API Routes
app.use("/api/v1", healthRoutes);
app.use("/api/v1", villageRoutes);
app.use("/api/v1", weatherRoutes);
app.use("/api/v1", recommendationRoutes);
app.use("/api/v1", aiRoutes);
app.use("/api/v1", satelliteRoutes);
app.use("/api/v1", scoreRoutes);
app.use("/api/v1", farmRoutes);
app.use("/api/v1", reportRoutes);
app.use("/api/v1", analysisRoutes);
app.use("/api/v1", historyRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "GramSankalpa API",
    description:
      "Localized Weather Forecast & Crop Recommendation Platform",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

// Start Server
async function startServer() {
  await connectDB();
  await loadVillages();

  app.listen(PORT, () => {
    console.log(
      `GramSankalpa Server running on http://localhost:${PORT}`,
    );
   
  });
}

startServer();

module.exports = app;
