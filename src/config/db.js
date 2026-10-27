const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;