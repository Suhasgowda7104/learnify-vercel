import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// POST /auth/register - Register a new student
router.post('/register', register);

// POST /auth/login - Authenticate user and return JWT
router.post('/login', login);

// POST /auth/logout - Invalidate user token/session
router.post('/logout', logout);

export default router;