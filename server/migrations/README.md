# Database Migrations

This directory contains database migration files for the Learnify project.

## Migration Files

1. **001_create_roles.migration.js** - Creates the roles table with default admin and student roles
2. **002_create_users.migration.js** - Creates the users table with foreign key to roles
3. **003_create_courses.migration.js** - Creates the courses table
4. **004_create_course_contents.migration.js** - Creates the course_contents table with foreign key to courses
5. **005_create_enrollments.migration.js** - Creates the enrollments table with foreign keys to users and courses

## Running Migrations

### Using npm script (recommended):
```bash
npm run migrate
```

### Using node directly:
```bash
node migrations/migrate.js
```

## Migration System Features

- **Automatic tracking**: Migrations are tracked in a `migrations` table
- **Sequential execution**: Migrations run in order based on filename
- **Idempotent**: Safe to run multiple times - only pending migrations execute
- **Rollback support**: Each migration includes `up()` and `down()` functions
- **Error handling**: Process exits on migration failure

## Database Schema

All tables use UUID primary keys for better scalability and security. The schema includes:

- **roles**: Admin and student roles
- **users**: User accounts with role references
- **courses**: Course information
- **course_contents**: Course materials (PDF/text)
- **enrollments**: Student course enrollments

## Notes

- Ensure your database connection is configured in `config/database.config.js`
- The `gen_random_uuid()` function requires PostgreSQL 13+ or the `pgcrypto` extension
- All foreign key relationships use CASCADE or RESTRICT as appropriate