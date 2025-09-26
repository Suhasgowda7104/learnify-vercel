import db from '../models/index.js';
import mongoose from 'mongoose';

const { Course, User, Enrollment, CourseContent } = db;

class AdminService {
  // Create a new course
  async createCourse(courseData) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // Create the course
      const course = await Course.create([{
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        durationHours: courseData.durationHours,
        thumbnail: courseData.thumbnail,
        isActive: courseData.isActive !== undefined ? courseData.isActive : true
      }], { session });

      // Create course content if provided
      if (courseData.courseContent && courseData.courseContent.length > 0) {
        const courseContentData = courseData.courseContent.map(content => ({
          courseId: course[0]._id,
          title: content.title,
          contentType: content.contentType,
          filePath: content.filePath || null
        }));

        await CourseContent.create(courseContentData, { session });
      }

      await session.commitTransaction();
      
      // Return course with content
      const courseWithContent = await Course.findById(course[0]._id).lean();
      const contents = await CourseContent.find({ courseId: course[0]._id }).lean();
      
      return {
        ...courseWithContent,
        id: courseWithContent._id,
        contents: contents.map(content => ({
          ...content,
          id: content._id
        }))
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Failed to create course: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Update an existing course
  async updateCourse(courseId, updateData) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Update course basic fields
      const { courseContent, ...courseFields } = updateData;
      await Course.findByIdAndUpdate(courseId, courseFields, { session });

      // Handle course content updates if provided
      if (courseContent !== undefined) {
        // Delete existing course content
        await CourseContent.deleteMany({ courseId }, { session });

        // Create new course content if provided
        if (courseContent && courseContent.length > 0) {
          const courseContentData = courseContent.map(content => ({
            courseId: courseId,
            title: content.title,
            contentType: content.contentType,
            filePath: content.filePath || null
          }));

          await CourseContent.create(courseContentData, { session });
        }
      }

      await session.commitTransaction();
      
      // Return updated course with content
      const updatedCourse = await Course.findById(courseId).lean();
      const contents = await CourseContent.find({ courseId }).lean();
      
      return {
        ...updatedCourse,
        id: updatedCourse._id,
        contents: contents.map(content => ({
          ...content,
          id: content._id
        }))
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Failed to update course: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  // Delete a course
  async deleteCourse(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if there are any enrollments
      const enrollmentCount = await Enrollment.countDocuments({ courseId });

      if (enrollmentCount > 0) {
        // Soft delete by setting isActive to false
        await Course.findByIdAndUpdate(courseId, { isActive: false });
        return { message: 'Course deactivated due to existing enrollments', course };
      } else {
        // Hard delete if no enrollments
        await Course.findByIdAndDelete(courseId);
        return { message: 'Course deleted successfully' };
      }
    } catch (error) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  // Get enrollment count for a specific course
  async getCourseEnrollmentCount(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const enrollmentCount = await Enrollment.countDocuments({ courseId });
      return enrollmentCount;
    } catch (error) {
      throw new Error(`Failed to get enrollment count: ${error.message}`);
    }
  }

  // Get students enrolled in a specific course
  async getEnrollmentsByCourse(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const enrollments = await Enrollment.find({ courseId })
        .populate({
          path: 'studentId',
          select: 'firstName lastName email createdAt',
          populate: {
            path: 'roleId',
            select: 'name'
          }
        })
        .sort({ enrollmentDate: -1 })
        .lean();

      return {
        course: {
          id: course._id,
          title: course.title,
          description: course.description
        },
        enrollments: enrollments.map(enrollment => ({
          id: enrollment._id,
          enrolled_at: enrollment.enrollmentDate,
          status: enrollment.status,
          completed_at: enrollment.completionDate,
          student: {
            id: enrollment.studentId._id,
            first_name: enrollment.studentId.firstName,
            last_name: enrollment.studentId.lastName,
            email: enrollment.studentId.email,
            role: enrollment.studentId.roleId?.name,
            joined_at: enrollment.studentId.createdAt
          }
        })),
        total_enrollments: enrollments.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch enrollments: ${error.message}`);
    }
  }

  // Get course statistics
  async getCourseStats() {
    try {
      const totalCourses = await Course.countDocuments();
      const activeCourses = await Course.countDocuments({ isActive: true });
      const totalEnrollments = await Enrollment.countDocuments();
      
      // Get student role
      const studentRole = await db.Role.findOne({ name: 'student' });
      const totalStudents = await User.countDocuments({ roleId: studentRole._id });

      return {
        total_courses: totalCourses,
        active_courses: activeCourses,
        total_enrollments: totalEnrollments,
        total_students: totalStudents
      };
    } catch (error) {
      throw new Error(`Failed to fetch course statistics: ${error.message}`);
    }
  }

  async getCourseEnrolledUsers(courseId) {
    console.log('Getting enrolled users for course ID:', courseId);
    
    const enrollments = await Enrollment.find({ 
      courseId: courseId,
      status: 'enrolled'
    })
    .populate({
      path: 'studentId',
      select: 'firstName lastName email',
      populate: {
        path: 'roleId',
        select: 'name'
      }
    })
    .select('enrollmentDate status')
    .sort({ enrollmentDate: -1 })
    .lean();

    console.log('Found enrolled users:', enrollments.length);
    
    return enrollments.map(enrollment => ({
      userId: enrollment.studentId._id,
      userName: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`,
      email: enrollment.studentId.email,
      enrollmentDate: enrollment.enrollmentDate
    }));
  }
}

export default new AdminService();