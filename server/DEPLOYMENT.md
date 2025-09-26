# Learnify Server - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- Node.js installed
- Vercel CLI installed: `npm install -g vercel`
- MongoDB Atlas cluster set up
- Vercel account created

### 2. Deploy to Vercel

```bash
# Navigate to server directory
cd server

# Login to Vercel (if not already logged in)
vercel login

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables

After deployment, set up environment variables in Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add the following variables for **Production** environment:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://suhas7104:learnify@cluster0.jun821w.mongodb.net/learnify` | MongoDB connection string |
| `DB_NAME` | `learnify` | Database name |
| `NODE_ENV` | `production` | Environment |
| `JWT_SECRET` | `your-32-char-secret-key-here` | JWT signing secret (generate strong key) |
| `JWT_EXPIRES_IN` | `24h` | JWT expiration time |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.vercel.app` | CORS allowed origins |
| `DOTENV_CONFIG_QUIET` | `true` | Suppress dotenv warnings |

### 4. Generate Strong JWT Secret

Generate a secure JWT secret (minimum 32 characters):

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator: https://generate-secret.vercel.app/32
```

### 5. Update CORS Origins

After deploying your frontend, update the `ALLOWED_ORIGINS` environment variable with your actual frontend URL.

## 📋 Project Structure

```
server/
├── config/
│   ├── database.config.js     # MongoDB connection
│   └── jwt.config.js          # JWT configuration
├── src/
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Authentication & validation
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   └── services/              # Business logic
├── migrations/                # Database migrations
├── index.js                   # Main server file
├── vercel.json               # Vercel configuration
└── .vercelignore             # Files to ignore during deployment
```

## 🔗 API Endpoints

After deployment, your API will be available at: `https://your-project-name.vercel.app`

### Health Check
- `GET /` - Server status
- `GET /api/v1/health` - Health check with database status

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Courses
- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/:id` - Get course details
- `GET /api/v1/courses/:id/content` - Get course content

### Admin (Protected)
- `POST /api/v1/admin/courses` - Create course
- `PUT /api/v1/admin/courses/:id` - Update course
- `DELETE /api/v1/admin/courses/:id` - Delete course
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics

### Student (Protected)
- `GET /api/v1/student/courses` - Student courses
- `POST /api/v1/enrollments/courses/:id/enroll` - Enroll in course
- `GET /api/v1/enrollments/enrollments` - Student enrollments

## 🔧 Configuration Files

### vercel.json
Configures Vercel deployment settings:
- Routes API calls to the Express server
- Sets production environment
- Configures function timeout

### .vercelignore
Excludes unnecessary files from deployment:
- node_modules
- Environment files
- Tests and documentation

## 🗄️ Database Setup

The server uses MongoDB with automatic migrations:

1. **Collections Created:**
   - `roles` - User roles (admin, student)
   - `users` - User accounts
   - `courses` - Course data
   - `enrollments` - Student enrollments

2. **Default Data:**
   - Admin role and Student role
   - Default admin user: `admin@learnify.com` / `admin123`

## 🔍 Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-project-name.vercel.app/

# API health
curl https://your-project-name.vercel.app/api/v1/health

# List courses
curl https://your-project-name.vercel.app/api/v1/courses
```

## 🚨 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check MONGODB_URI in environment variables
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0

2. **CORS Errors**
   - Update ALLOWED_ORIGINS with your frontend URL
   - Ensure the frontend URL is correct

3. **JWT Errors**
   - Generate a strong JWT_SECRET (32+ characters)
   - Ensure JWT_SECRET is set in environment variables

4. **Function Timeout**
   - Check Vercel function logs
   - Ensure database operations are optimized

### Logs and Monitoring:

- View deployment logs in Vercel Dashboard
- Check function logs for runtime errors
- Monitor performance in Vercel Analytics

## 🔄 Redeployment

To redeploy after changes:

```bash
# Deploy latest changes
vercel --prod

# Or trigger redeployment from Vercel Dashboard
```

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test MongoDB connection
4. Review API endpoint responses