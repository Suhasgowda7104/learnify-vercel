import courseService from '../services/course.service.js';
import db from '../models/index.js';

const { CourseContent } = db;

/**
 * Course Controller
 * Handles public course operations accessible by both admin & students
 */

/**
 * Get all active courses
 * GET /api/courses
 * Public endpoint: list all courses
 */
export const getAllCourses = async (req, res) => {
    try {
        const courses = await courseService.getAllActiveCourses();
        
        res.status(200).json({
            message: 'Courses retrieved successfully',
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 * Public endpoint: get course details
 */
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                message: 'Course ID is required',
                success: false
            });
        }
        
        const course = await courseService.getCourseById(id);
        
        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
                success: false
            });
        }
        
        // Only return active courses for public access
        if (!course.isActive) {
            return res.status(404).json({
                message: 'Course not found',
                success: false
            });
        }
        
        res.status(200).json({
            message: 'Course retrieved successfully',
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get course contents
 * GET /api/courses/:id/content
 * Get course materials (PDF, video links, text)
 */
export const getCourseContent = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                message: 'Course ID is required',
                success: false
            });
        }
        
        // First verify the course exists and is active
        const course = await courseService.getCourseById(id);
        
        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
                success: false
            });
        }
        
        if (!course.isActive) {
            return res.status(404).json({
                message: 'Course not found',
                success: false
            });
        }
        
        // Get course contents
        const courseContents = await CourseContent.findAll({
            where: {
                courseId: id
            },
            attributes: ['id', 'title', 'contentType', 'filePath', 'created_at', 'updated_at'],
            order: [['created_at', 'ASC']]
        });
        
        res.status(200).json({
            message: 'Course content retrieved successfully',
            success: true,
            data: {
                course: {
                    id: course.id,
                    title: course.title,
                    description: course.description
                },
                contents: courseContents
            }
        });
    } catch (error) {
        console.error('Error fetching course content:', error);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: error.message
        });
    }
};