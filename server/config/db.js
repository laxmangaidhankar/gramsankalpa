const mongoose = require("mongoose");
const env = require("./env.js");

async function connectDB() {
  const mongoUri = env.MONGODB_URI;

  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log("[MongoDB] Connected successfully");
    return true;

  } catch (error) {
    console.warn(
      `[MongoDB Warning] Could not connect to MongoDB. ` +
      `Operating with in-memory fallback store.`
    );

    return false;
  }
}

module.exports = { connectDB };