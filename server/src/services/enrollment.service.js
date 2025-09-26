import db from '../models/index.js';

const { Course, User, Enrollment } = db;

class EnrollmentService { 
    async enrollInCourse(studentId, courseId) {
    // Check if course exists and is active
    const course = await Course.findOne({
      _id: courseId,
      isActive: true 
    });

    if (!course) {
      throw new Error('Course not found or not available');
    }

    // Check if student exists
    const student = await User.findById(studentId).populate('roleId', 'name');

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.roleId.name !== 'student') {
      throw new Error('Only students can enroll in courses');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: studentId,
      courseId: courseId
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: studentId,
      courseId: courseId,
      status: 'enrolled'
    });

    return {
      id: enrollment._id,
      courseId: courseId,
      courseTitle: course.title,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status
    };
  }

  async getStudentEnrollments(studentId) {
    console.log('🔍 Getting enrollments for student ID:', studentId);
    
    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        match: { isActive: true },
        select: '_id title description price durationHours'
      })
      .select('_id enrollmentDate status completionDate')
      .sort({ enrollmentDate: -1 })
      .lean();

    // Filter out enrollments where course is null (inactive courses)
    const activeEnrollments = enrollments.filter(enrollment => enrollment.courseId);

    console.log('📊 Found enrollments:', activeEnrollments.length);
    activeEnrollments.forEach((enrollment, index) => {
      console.log(`📝 Enrollment ${index + 1}:`, {
        id: enrollment._id,
        studentId: studentId,
        courseId: enrollment.courseId._id,
        courseTitle: enrollment.courseId?.title
      });
    });

    return activeEnrollments.map(enrollment => ({
      id: enrollment._id,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
      completionDate: enrollment.completionDate,
      course: {
        id: enrollment.courseId._id,
        title: enrollment.courseId.title,
        description: enrollment.courseId.description,
        price: enrollment.courseId.price,
        durationHours: enrollment.courseId.durationHours
      }
    }));
  }
}
export default new EnrollmentService();