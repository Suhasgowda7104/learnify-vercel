import mongoose from 'mongoose';
import { dbConfig } from '../../config/database.config.js';

// Import all models
import Role from './role.model.js';
import User from './user.model.js';
import Course from './course.model.js';
import CourseContent from './courseContent.model.js';
import Enrollment from './enrollment.model.js';

// Export models
const db = {
  Role,
  User,
  Course,
  CourseContent,
  Enrollment,
  mongoose,
  dbConfig
};

// Database connection and sync function
const syncDatabase = async (force = false) => {
  try {
    // Connect to MongoDB
    await dbConfig.connect();
    console.log('✅ Database connection established successfully.');
    
    // In MongoDB, we don't need to sync like in SQL databases
    // But we can ensure indexes are created
    await Promise.all([
      Role.createIndexes(),
      User.createIndexes(),
      Course.createIndexes(),
      CourseContent.createIndexes(),
      Enrollment.createIndexes()
    ]);
    
    console.log('✅ Database indexes synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

export { syncDatabase };
export default db;