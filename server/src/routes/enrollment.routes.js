import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { enrollInCourse, getStudentEnrollments} from '../controllers/enrollment.controller.js';    
import { authenticateToken, requireStudent } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireStudent);

router.post('/courses/:id/enroll', authenticateToken, requireStudent, enrollInCourse);
router.get('/enrollments', authenticateToken, requireStudent, getStudentEnrollments);

export default router;