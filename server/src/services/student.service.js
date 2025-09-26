import db from '../models/index.js';
const { Course } = db;

class StudentService {
  async getAllActiveCourses() {
    return await Course.find({ isActive: true })
      .select('_id title description price durationHours createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .then(courses => courses.map(course => ({
        ...course,
        id: course._id,
        created_at: course.createdAt
      })));
  }

  async getCourseById(courseId) {
    const course = await Course.findOne({ 
      _id: courseId,
      isActive: true 
    })
    .select('_id title description price durationHours createdAt')
    .lean();

    if (!course) {
      return null;
    }

    return {
      ...course,
      id: course._id,
      created_at: course.createdAt
    };
  }  
}

export default new StudentService();