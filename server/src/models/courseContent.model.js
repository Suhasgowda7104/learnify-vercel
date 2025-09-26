import mongoose from 'mongoose';

const courseContentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 255
  },
  contentType: {
    type: String,
    required: true,
    maxlength: 20,
    enum: {
      values: ['pdf', 'text'],
      message: "Content type must be either 'pdf' or 'text'"
    }
  },
  filePath: {
    type: String,
    required: false,
    maxlength: 500
  }
}, {
  timestamps: true,
  collection: 'course_contents'
});

// Virtual for course relationship
courseContentSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
courseContentSchema.set('toJSON', { virtuals: true });
courseContentSchema.set('toObject', { virtuals: true });

// Index for better performance
courseContentSchema.index({ courseId: 1 });
courseContentSchema.index({ contentType: 1 });

const CourseContent = mongoose.model('CourseContent', courseContentSchema);

export default CourseContent;