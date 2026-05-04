const mongoose = require('mongoose');

/**
 * Establishes MongoDB connection with retry logic.
 * Exits the process on permanent failure to prevent a zombie server.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] MONGO_URI is not defined. Check your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose 8+ has these set by default, but explicit for clarity
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Connection failed: ${err.message}`);
    process.exit(1);
  }
};

// Log future disconnections (e.g. Atlas network blip)
mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected. Mongoose will attempt reconnect.');
});

module.exports = connectDB;
