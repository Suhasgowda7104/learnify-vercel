import { sequelize } from '../config/database.config.js';
import bcryptjs from 'bcryptjs';

export const up = async () => {
  console.log('🔧 Creating users table...');
  
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await sequelize.query(createUsersTable);
  
  // Create indexes for better performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
  `;
  
  await sequelize.query(createIndexes);
  
  // Get admin role ID
  const adminRoleResult = await sequelize.query("SELECT id FROM roles WHERE name = 'admin' LIMIT 1;", { type: sequelize.QueryTypes.SELECT });
  
  if (adminRoleResult.length === 0) {
    throw new Error('Admin role not found. Please run roles migration first.');
  }
  
  const adminRoleId = adminRoleResult[0].id;
  
  // Hash the default admin password
  const defaultAdminPassword = 'admin123'; // Change this to a secure password
  const saltRounds = 10;
  const hashedPassword = await bcryptjs.hash(defaultAdminPassword, saltRounds);
  
  // Insert default admin user
  const insertAdminUser = `
    INSERT INTO users (id, email, password, first_name, last_name, role_id, is_active, created_at, updated_at) 
    VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO NOTHING;
  `;
  
  await sequelize.query(insertAdminUser, {
    replacements: [
      'admin@learnify.com',
      hashedPassword,
      'Admin',
      'User',
      adminRoleId,
      true
    ]
  });
  
  console.log('✅ Users table created with default admin user');
  console.log('📧 Admin credentials: admin@learnify.com / admin123');
  console.log('⚠️  Please change the admin password after first login!');
};

export const down = async () => {
  await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
  console.log('❌ Users table dropped');
};