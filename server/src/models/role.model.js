import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20,
    enum: {
      values: ['admin', 'student'],
      message: "Role name must be either 'admin' or 'student'"
    }
  }
}, {
  timestamps: true,
  collection: 'roles'
});

// Virtual for users relationship
roleSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'roleId'
});

// Ensure virtual fields are serialized
roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

const Role = mongoose.model('Role', roleSchema);

export default Role;