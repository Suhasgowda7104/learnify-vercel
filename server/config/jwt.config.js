import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT Configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256',
  issuer: 'learnify-api',
  audience: 'learnify-users'
};

// Generate JWT Token
export const generateToken = (payload) => {
  try {
    return jwt.sign(
      payload,
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
        algorithm: jwtConfig.algorithm,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    );
  } catch (error) {
    throw new Error('Token generation failed: ' + error.message);
  }
};

// Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
  } catch (error) {
    throw new Error('Token verification failed: ' + error.message);
  }
};

// Decode JWT Token (without verification)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error('Token decoding failed: ' + error.message);
  }
};

// JWT Middleware for protecting routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Access token is required',
      success: false
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token',
      success: false
    });
  }
};

// Role-based authorization middleware
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        success: false
      });
    }

    next();
  };
};

// Extract token from request
export const extractToken = (req) => {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1];
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export default {
  jwtConfig,
  generateToken,
  verifyToken,
  decodeToken,
  authenticateToken,
  authorizeRole,
  extractToken,
  isTokenExpired
};