import db from '../models/index.js';

const { Course, User, Role, CourseContent, Enrollment } = db;

class CourseService {
  async createCourse(courseData) {
    const { title, description } = courseData;

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    const newCourse = await Course.create({
      title,
      description,
      isActive: true
    });

    return newCourse;
  }

  async getAllActiveCourses() {
    const courses = await Course.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Get enrollment counts for each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });
        return {
          ...course,
          id: course._id,
          enrollmentCount,
          created_at: course.createdAt,
          updated_at: course.updatedAt
        };
      })
    );

    return coursesWithCounts;
  }

  async getCourseById(courseId) {
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return null;
    }

    // Get course contents
    const contents = await CourseContent.find({ courseId })
      .select('_id title contentType filePath createdAt updatedAt')
      .sort({ createdAt: 1 })
      .lean();

    return {
      ...course,
      id: course._id,
      contents: contents.map(content => ({
        ...content,
        id: content._id,
        created_at: content.createdAt,
        updated_at: content.updatedAt
      })),
      created_at: course.createdAt,
      updated_at: course.updatedAt
    };
  }

  async updateCourse(courseId, updateData, requesterId) {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if requester is admin
    const requester = await User.findById(requesterId).populate('roleId', 'name');

    if (!requester) {
      throw new Error('Requester not found');
    }

    if (requester.roleId.name !== 'admin') {
      throw new Error('Only admin users can update courses');
    }

    // Update course
    await Course.findByIdAndUpdate(courseId, updateData, { new: true });
    return await this.getCourseById(courseId);
  }

  async deleteCourse(courseId, requesterId) {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if requester is admin
    const requester = await User.findById(requesterId).populate('roleId', 'name');

    if (!requester || requester.roleId.name !== 'admin') {
      throw new Error('Only admin users can delete courses');
    }

    // Soft delete by setting isActive to false
    await Course.findByIdAndUpdate(courseId, { isActive: false });
    return true;
  }

  async searchCourses(searchTerm) {
    return await Course.find({
      isActive: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();
  }
}

export default new CourseService();