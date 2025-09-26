import express from 'express';
import { getAllCourses, getCourseById, getCourseContent } from '../controllers/course.controller.js';

const router = express.Router();

/**
 * Course Routes
 * Public endpoints accessible by both admin & students
 */

// GET /api/courses - Public endpoint: list all courses
router.get('/', getAllCourses);

// GET /api/courses/:id - Public endpoint: get course details
router.get('/:id', getCourseById);

// GET /api/courses/:id/content - Get course contents
router.get('/:id/content', getCourseContent);

export default router;