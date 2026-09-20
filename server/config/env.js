const dotenv = require("dotenv");

dotenv.config();

const required = ["MONGODB_URI", "FASTAPI_URL"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  PORT: Number(process.env.PORT || 8000),
  MONGODB_URI: process.env.MONGODB_URI,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:5173",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  FASTAPI_URL: process.env.FASTAPI_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEE_PROJECT_ID: process.env.GEE_PROJECT_ID || "",
  GEE_SERVICE_ACCOUNT_EMAIL: process.env.GEE_SERVICE_ACCOUNT_EMAIL || "",
  GEE_CREDENTIALS_PATH:
    process.env.GEE_CREDENTIALS_PATH || "./credentials/gee.json",
  USE_MOCK_DATA: process.env.USE_MOCK_DATA === "true",
};

module.exports = env;
