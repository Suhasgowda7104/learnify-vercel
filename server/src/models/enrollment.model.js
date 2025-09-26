import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    maxlength: 20,
    default: 'enrolled',
    enum: {
      values: ['enrolled', 'completed'],
      message: "Status must be either 'enrolled' or 'completed'"
    }
  },
  completionDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  collection: 'enrollments'
});

// Virtual for student relationship
enrollmentSchema.virtual('student', {
  ref: 'User',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for course relationship
enrollmentSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', { virtuals: true });
enrollmentSchema.set('toObject', { virtuals: true });

// Compound index for unique enrollment per student per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Additional indexes for better performance
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;