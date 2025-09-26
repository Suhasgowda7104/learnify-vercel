import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class MongoDBConfig {
  constructor() {
    this.connectionString = this.buildConnectionString();
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: process.env.NODE_ENV === 'production' ? 2 : 10, // Reduced for serverless
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
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
      console.error('❌ MongoDB connection error:', error.message);
      
      // Log specific error types for debugging
      if (error.name === 'MongoServerSelectionError') {
        console.error('💡 Tip: Check if MongoDB is running and accessible');
      } else if (error.name === 'MongoParseError') {
        console.error('💡 Tip: Check your MongoDB connection string format');
      }
      
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
      throw error;
    }
  }

  // Health check for serverless environments
  async healthCheck() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      return {
        status: states[state] || 'unknown',
        database: mongoose.connection.name,
        host: mongoose.connection.host
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Get connection instance
  getConnection() {
    return mongoose.connection;
  }

  // Check if connected
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Create and export singleton instance
const mongoConfig = new MongoDBConfig();

export default mongoConfig;

// Export mongoose for direct use in models
export { mongoose };

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🚨 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoConfig.disconnect();
    console.log('👋 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});