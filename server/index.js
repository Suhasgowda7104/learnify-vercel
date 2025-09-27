import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from './config/database.config.js';
import { syncDatabase } from './src/models/index.js';
import authRoutes from './src/routes/auth.route.js';
import courseRoutes from './src/routes/course.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:4200', 
  'http://127.0.0.1:4200', 
  'http://localhost:8081', 
  'http://127.0.0.1:8081',
  'https://learnify-vercel.vercel.app' // Production frontend URL
];

// Add ALLOWED_ORIGINS from environment if specified
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Original-Password']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Status: ${res.statusCode} - ${responseTime}ms - IP: ${req.ip}`);
    return originalSend.call(this, data);
  };
  
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Learnify Server is running!' });
});

app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Learnify API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      health: '/api/v1/health'
    }
  });
});

app.get('/api/v1/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    status: 'OK', 
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connected');
      await syncDatabase();
    } else {
      console.log('❌ Failed to connect to database');
    }
  });
} else {
  // Initialize database connection for production
  (async () => {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connected');
      await syncDatabase();
    } else {
      console.log('❌ Failed to connect to database');
    }
  })();
}

// Export for Vercel serverless functions
export default app;