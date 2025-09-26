import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

class DatabaseConfig {
  constructor() {
    this.connectionString = this.buildConnectionString();
    this.options = {
      maxPoolSize: process.env.NODE_ENV === 'production' ? 2 : 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };
  }

  buildConnectionString() {
    // Option 1: Use MONGODB_URI if provided (recommended for production)
    if (process.env.MONGODB_URI) {
      return process.env.MONGODB_URI;
    }

    // Option 2: Build connection string from individual components
    const host = process.env.MONGODB_HOST || 'localhost';
    const port = process.env.MONGODB_PORT || '27017';
    const database = process.env.MONGODB_DATABASE || process.env.DB_NAME || 'learnify';
    const user = process.env.MONGODB_USER;
    const password = process.env.MONGODB_PASSWORD;

    if (user && password) {
      return `mongodb://${user}:${password}@${host}:${port}/${database}`;
    } else {
      return `mongodb://${host}:${port}/${database}`;
    }
  }

  async connect() {
    try {
      console.log('🔄 Connecting to MongoDB...');
      console.log(`📍 Connection string: ${this.connectionString.replace(/\/\/.*@/, '//***:***@')}`);
      
      await mongoose.connect(this.connectionString, this.options);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ MongoDB disconnection failed:', error.message);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Create singleton instance
const dbConfig = new DatabaseConfig();

// Export functions for backward compatibility
export async function testConnection() {
  try {
    if (dbConfig.isConnected()) {
      console.log('Database connection successful.');
      return true;
    }
    
    await dbConfig.connect();
    console.log('Database connection successful.');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

export { dbConfig };
export default dbConfig;
