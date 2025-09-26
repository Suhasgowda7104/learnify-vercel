import { sequelize } from '../config/database.config.js';

export const up = async () => {
  const createRolesTable = `
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('admin', 'student')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await sequelize.query(createRolesTable);
  
  // Insert default roles
  const insertDefaultRoles = `
    INSERT INTO roles (id, name, created_at, updated_at) VALUES 
    (gen_random_uuid(), 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'student', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (name) DO NOTHING;
  `;
  
  await sequelize.query(insertDefaultRoles);
  
  console.log('✅ Roles table created with default roles');
};

export const down = async () => {
  await sequelize.query('DROP TABLE IF EXISTS roles CASCADE;');
  console.log('❌ Roles table dropped');
};