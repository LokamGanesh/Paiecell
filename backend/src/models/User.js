import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  college: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    enum: ['AIDS', 'AIML', 'CSE', 'CSD', 'CIC', 'CSB', 'SCS', 'IT', 'ITC', 'CIVIL', 'MECH', 'ECE', 'EEE'],
    trim: true
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'facilitator'],
    default: 'student'
  },
  userType: {
    type: String,
    enum: ['student', 'corporate', 'partner'],
    default: 'student'
  },
  organization: {
    type: String,
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
