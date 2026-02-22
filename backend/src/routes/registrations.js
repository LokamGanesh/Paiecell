import express from 'express';
import { body, validationResult } from 'express-validator';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Course from '../models/Course.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Register for an event or course (authenticated users)
router.post('/',
  auth,
  [
    body('eventId').optional().isMongoId(),
    body('courseId').optional().isMongoId(),
    body('type').isIn(['event', 'course'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { eventId, courseId, type } = req.body;

      // Validate that either eventId or courseId is provided
      if (type === 'event' && !eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }
      if (type === 'course' && !courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      // Check if event/course exists
      if (type === 'event') {
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Check capacity
        if (event.capacity > 0) {
          const registrationCount = await Registration.countDocuments({ 
            event: eventId, 
            status: { $ne: 'cancelled' } 
          });
          if (registrationCount >= event.capacity) {
            return res.status(400).json({ error: 'Event is full' });
          }
        }
      } else {
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        // Check capacity
        if (course.capacity > 0) {
          const registrationCount = await Registration.countDocuments({ 
            course: courseId, 
            status: { $ne: 'cancelled' } 
          });
          if (registrationCount >= course.capacity) {
            return res.status(400).json({ error: 'Course is full' });
          }
        }
      }

      // Check if already registered
      const existingRegistration = await Registration.findOne({
        user: req.user._id,
        ...(type === 'event' ? { event: eventId } : { course: courseId })
      });

      if (existingRegistration) {
        return res.status(400).json({ error: 'Already registered' });
      }

      // Create registration with user snapshot
      const registration = await Registration.create({
        user: req.user._id,
        ...(type === 'event' ? { event: eventId } : { course: courseId }),
        type,
        userSnapshot: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          college: req.user.college,
          department: req.user.department,
          year: req.user.year
        }
      });

      // Update registration count
      if (type === 'event') {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { registrationCount: 1 }
        });
      } else {
        await Course.findByIdAndUpdate(courseId, {
          $inc: { enrollmentCount: 1 }
        });
      }

      await registration.populate([
        { path: 'user', select: 'name email phone' },
        { path: 'event', select: 'title date venue' },
        { path: 'course', select: 'title duration' }
      ]);

      res.status(201).json({ 
        message: 'Registration successful',
        registration 
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Already registered' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all registrations (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { type, status, eventId, courseId } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (eventId) filter.event = eventId;
    if (courseId) filter.course = courseId;

    const registrations = await Registration.find(filter)
      .populate('user', 'name email phone college department year')
      .populate('event', 'title date venue category')
      .populate('course', 'title duration category')
      .sort({ registeredAt: -1 });

    res.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my registrations (authenticated user)
router.get('/my', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event', 'title date venue category image')
      .populate('course', 'title duration category image')
      .sort({ registeredAt: -1 });

    res.json({ registrations });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel registration
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Update registration count
    if (registration.type === 'event') {
      await Event.findByIdAndUpdate(registration.event, {
        $inc: { registrationCount: -1 }
      });
    } else {
      await Course.findByIdAndUpdate(registration.course, {
        $inc: { enrollmentCount: -1 }
      });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update registration status (admin only)
router.patch('/:id/status',
  auth,
  adminAuth,
  [body('status').isIn(['pending', 'confirmed', 'cancelled', 'attended'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const registration = await Registration.findById(req.params.id);

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const oldStatus = registration.status;
      registration.status = req.body.status;
      await registration.save();

      // Update counts if status changed to/from cancelled
      if (oldStatus !== 'cancelled' && req.body.status === 'cancelled') {
        if (registration.type === 'event') {
          await Event.findByIdAndUpdate(registration.event, {
            $inc: { registrationCount: -1 }
          });
        } else {
          await Course.findByIdAndUpdate(registration.course, {
            $inc: { enrollmentCount: -1 }
          });
        }
      } else if (oldStatus === 'cancelled' && req.body.status !== 'cancelled') {
        if (registration.type === 'event') {
          await Event.findByIdAndUpdate(registration.event, {
            $inc: { registrationCount: 1 }
          });
        } else {
          await Course.findByIdAndUpdate(registration.course, {
            $inc: { enrollmentCount: 1 }
          });
        }
      }

      res.json({ message: 'Status updated successfully', registration });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
