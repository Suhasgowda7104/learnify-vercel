import express from 'express';
import adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { createCourseValidation, updateCourseValidation } from '../middleware/course.validation.js';

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireAdmin);


router.post('/courses', createCourseValidation, adminController.createCourse);
router.put('/courses/:id', updateCourseValidation, adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

router.get('/enrollments/:courseId', adminController.getEnrollmentsByCourse);
router.get('/courses/:courseId/enrollment-count', adminController.getCourseEnrollmentCount);

router.get('/dashboard/stats', adminController.getCourseStats);
router.get('/courses/:courseId/users', adminController.getCourseEnrolledUsers);

export default router;