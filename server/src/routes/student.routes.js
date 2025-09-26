import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js'
import { getAllCourses, getCourseById } from '../controllers/student.controller.js';
import { authenticateToken, requireStudent } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireStudent);

router.get('/courses', getAllCourses); 
router.get('/courses/:id', getCourseById);

export default router;