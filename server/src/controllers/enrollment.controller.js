import db from '../models/index.js';
import EnrollmentService from '../services/enrollment.service.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id; // From auth middleware

    if (!studentId) {
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    if (!id) {
      return res.status(400).json({
        message: 'Course ID is required',
        success: false
      });
    }

    const enrollment = await EnrollmentService.enrollInCourse(studentId, id);

    res.status(201).json({
      message: 'Successfully enrolled in course',
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    // Handle specific business logic errors
    if (error.message === 'Course not found or not available' ||
        error.message === 'Already enrolled in this course' ||
        error.message === 'Only students can enroll in courses') {
      return res.status(400).json({
        message: error.message,
        success: false
      });
    }

    if (error.message === 'Student not found') {
      return res.status(404).json({
        message: error.message,
        success: false
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.user?.id; // From auth middleware

    if (!studentId) {
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    const enrollments = await EnrollmentService.getStudentEnrollments(studentId);

    res.status(200).json({
      message: 'Enrollments retrieved successfully',
      success: true,
      data: enrollments,
      total: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      error: error.message
    });
  }
};