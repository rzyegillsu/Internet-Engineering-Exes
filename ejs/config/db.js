const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connectDB = async () => {
  if (process.env.SKIP_DB === "true") {
    console.warn("⚠️  SKIP_DB=true → MongoDB connection skipped (useful for tests)");
    return;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todo_app";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
