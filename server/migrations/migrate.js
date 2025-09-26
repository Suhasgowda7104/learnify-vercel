import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import mongoConfig, { testConnection } from '../config/database.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Migration System
class MongoDBMigrationRunner {
  constructor() {
    this.migrationsCollection = 'migrations';
  }

  async connect() {
    await mongoConfig.connect();
  }

  async disconnect() {
    await mongoConfig.disconnect();
  }

  // Create migrations tracking collection
  async createMigrationsCollection() {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: this.migrationsCollection }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection(this.migrationsCollection);
      console.log(`✅ Created ${this.migrationsCollection} collection`);
    }
  }

  // Check if migration has been run
  async isMigrationRun(migrationName) {
    const db = mongoose.connection.db;
    const migration = await db.collection(this.migrationsCollection)
      .findOne({ name: migrationName });
    return !!migration;
  }

  // Mark migration as completed
  async markMigrationCompleted(migrationName) {
    const db = mongoose.connection.db;
    await db.collection(this.migrationsCollection).insertOne({
      name: migrationName,
      executedAt: new Date(),
      status: 'completed'
    });
  }

  // Get all migration files
  getMigrationFiles() {
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.migration.js') && file !== 'migrate.js')
      .sort();
    return files;
  }

  // Run specific migration for MongoDB
  async runRolesMigration() {
    const db = mongoose.connection.db;
    
    // Check if roles collection exists
    const collections = await db.listCollections({ name: 'roles' }).toArray();
    
    if (collections.length === 0) {
      // Create roles collection with validation
      await db.createCollection('roles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name'],
          properties: {
            name: {
              bsonType: 'string',
              enum: ['admin', 'student'],
              maxLength: 20
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

      // Create indexes
      await db.collection('roles').createIndexes([
        { key: { name: 1 }, unique: true }
      ]);
      console.log('✅ Roles collection created');
    } else {
      console.log('ℹ️  Roles collection already exists');
    }

    // Insert default roles
    const adminRoleExists = await db.collection('roles').findOne({ name: 'admin' });
    const studentRoleExists = await db.collection('roles').findOne({ name: 'student' });
    
    if (!adminRoleExists) {
      await db.collection('roles').insertOne({
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('👑 Default admin role created');
    }
    
    if (!studentRoleExists) {
      await db.collection('roles').insertOne({
        name: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('🎓 Default student role created');
    }
  }

  // Run users migration for MongoDB
  async runUsersMigration() {
    const db = mongoose.connection.db;
    
    // Check if users collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      // Create users collection with validation
      await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'roleId'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            },
            password: { bsonType: 'string', minLength: 6 },
            firstName: { bsonType: 'string', minLength: 1, maxLength: 50 },
            lastName: { bsonType: 'string', minLength: 1, maxLength: 50 },
            roleId: { bsonType: 'objectId' },
            isActive: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

      // Create indexes
      await db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { roleId: 1 } },
        { key: { isActive: 1 } },
        { key: { createdAt: -1 } }
      ]);
      console.log('✅ Users collection created');
    } else {
      console.log('ℹ️  Users collection already exists');
    }

    // Create default admin user
    const adminExists = await db.collection('users').findOne({ email: 'admin@learnify.com' });
    
    if (!adminExists) {
      // Get admin role
      const adminRole = await db.collection('roles').findOne({ name: 'admin' });
      if (!adminRole) {
        throw new Error('Admin role not found. Please run roles migration first.');
      }

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 12);
      
      await db.collection('users').insertOne({
        email: 'admin@learnify.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole._id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('👤 Default admin user created: admin@learnify.com / admin123');
      console.log('⚠️  Please change the admin password after first login!');
    }
  }

  // Run all migrations
  async runMigrations() {
    try {
      console.log('🚀 Starting MongoDB migrations...');
      
      await this.createMigrationsCollection();

      // Migration 1: Create Roles Collection
      if (!await this.isMigrationRun('001_create_roles.migration.js')) {
        console.log('🔄 Running: 001_create_roles.migration.js');
        await this.runRolesMigration();
        await this.markMigrationCompleted('001_create_roles.migration.js');
        console.log('✅ Migration 001_create_roles.migration.js completed');
      }

      // Migration 2: Create Users Collection
      if (!await this.isMigrationRun('002_create_users.migration.js')) {
        console.log('🔄 Running: 002_create_users.migration.js');
        await this.runUsersMigration();
        await this.markMigrationCompleted('002_create_users.migration.js');
        console.log('✅ Migration 002_create_users.migration.js completed');
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

// Run migrations
const runMigrations = async () => {
  const migration = new MongoDBMigrationRunner();
  
  try {
    console.log('🚀 Starting MongoDB migration process...');
    console.log('Current working directory:', process.cwd());
    console.log('Migration directory:', __dirname);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }
    console.log('✅ Database connection test passed');
    
    await migration.connect();
    await migration.runMigrations();
    await migration.disconnect();
    
    console.log('🏁 Migration process completed successfully');
    return true;
  } catch (error) {
    console.error('💥 Migration process failed:', error);
    await migration.disconnect();
    return false;
  }
};

// Run migrations if this file is executed directly
// Normalize paths for Windows compatibility
const currentFileUrl = import.meta.url;
const expectedUrl = `file:///${process.argv[1].replace(/\\/g, '/')}`;

if (currentFileUrl === expectedUrl) {
  runMigrations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

export { runMigrations };