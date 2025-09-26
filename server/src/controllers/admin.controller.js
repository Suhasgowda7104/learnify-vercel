import adminService from '../services/admin.service.js';
import { validationResult } from 'express-validator';

class AdminController {
  async createCourse(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const courseData = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        durationHours: req.body.durationHours,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        courseContent: req.body.courseContent || []
      };

      const course = await adminService.createCourse(courseData);

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create course'
      });
    }
  }

  async updateCourse(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const courseId = req.params.id;
      const updateData = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        durationHours: req.body.durationHours,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        courseContent: req.body.courseContent || []
      };

      const course = await adminService.updateCourse(courseId, updateData);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Update course error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update course'
      });
    }
  }

  async deleteCourse(req, res) {
    try {
      const courseId = req.params.id;
      const result = await adminService.deleteCourse(courseId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.course || null
      });
    } catch (error) {
      console.error('Delete course error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete course'
      });
    }
  }



  async getEnrollmentsByCourse(req, res) {
    try {
      const courseId = req.params.courseId;
      const enrollmentData = await adminService.getEnrollmentsByCourse(courseId);

      res.status(200).json({
        success: true,
        message: 'Enrollments retrieved successfully',
        data: enrollmentData
      });
    } catch (error) {
      console.error('Get enrollments error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve enrollments'
      });
    }
  }

  async getCourseEnrollmentCount(req, res) {
    try {
      const courseId = req.params.courseId;
      const enrollmentCount = await adminService.getCourseEnrollmentCount(courseId);

      res.status(200).json({
        success: true,
        message: 'Enrollment count retrieved successfully',
        data: {
          courseId: courseId,
          enrollmentCount: enrollmentCount
        }
      });
    } catch (error) {
      console.error('Get enrollment count error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve enrollment count'
      });
    }
  }

  async getCourseStats(req, res) {
    try {
      const stats = await adminService.getCourseStats();

      res.status(200).json({
        success: true,
        message: 'Course statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get course stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve course statistics'
      });
    }
  }
  async getCourseEnrolledUsers(req, res) {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const enrolledUsers = await adminService.getCourseEnrolledUsers(courseId);

      res.status(200).json({
        success: true,
        message: 'Enrolled users retrieved successfully',
        data: enrolledUsers,
        total: enrolledUsers.length
      });
    } catch (error) {
      console.error('Get enrolled users error:', error);
      if (error.message === 'Course not found') {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve enrolled users'
      });
    }
  }

}

export default new AdminController();