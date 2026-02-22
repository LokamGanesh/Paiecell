import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  type: {
    type: String,
    enum: ['event', 'course'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended'],
    default: 'confirmed'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  // Store user details at time of registration
  userSnapshot: {
    name: String,
    email: String,
    phone: String,
    college: String,
    department: String,
    year: String
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true, sparse: true });
registrationSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });

// Index for faster queries
registrationSchema.index({ type: 1, status: 1 });
registrationSchema.index({ registeredAt: -1 });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
