import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Workshop', 'Seminar', 'Corporate', 'Cultural', 'Technical', 'Sports']
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 1,
    min: 1
  },
  time: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    default: null
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 0
  },
  registrationCount: {
    type: Number,
    default: 0
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  externalLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
eventSchema.index({ date: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ date: 1, status: 1 });

export default mongoose.model('Event', eventSchema);
