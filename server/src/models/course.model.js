import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: false
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0.00,
    validate: {
      validator: function(value) {
        return parseFloat(value.toString()) >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  durationHours: {
    type: Number,
    required: false,
    min: [1, 'Duration must be at least 1 hour']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'courses'
});

// Virtual for course contents relationship
courseSchema.virtual('contents', {
  ref: 'CourseContent',
  localField: '_id',
  foreignField: 'courseId'
});

// Virtual for enrollments relationship
courseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'courseId'
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

// Transform price for JSON output
courseSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    if (ret.price) {
      ret.price = parseFloat(ret.price.toString());
    }
    return ret;
  }
});

// Index for better performance
courseSchema.index({ title: 1 });
courseSchema.index({ isActive: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;