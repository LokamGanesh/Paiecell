import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Course from '../models/Course.js';
import { sendBulkEmails, getReminderEmailTemplate } from '../utils/emailService.js';

const router = express.Router();

// Get users for email targeting
router.get('/users-for-email', auth, adminAuth, async (req, res) => {
  try {
    const { type } = req.query; // 'all', 'event', 'course', 'upcoming'

    let users = [];

    if (type === 'all') {
      users = await User.find().select('_id name email').lean();
    } else if (type === 'event') {
      const registrations = await Registration.find({ type: 'event' })
        .populate('user', '_id name email')
        .lean();
      users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
    } else if (type === 'course') {
      const registrations = await Registration.find({ type: 'course' })
        .populate('user', '_id name email')
        .lean();
      users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
    } else if (type === 'upcoming') {
      // Users registered for upcoming events/courses
      const now = new Date();
      const upcomingEvents = await Event.find({ date: { $gte: now } }).select('_id').lean();
      const upcomingCourses = await Course.find({ status: 'upcoming' }).select('_id').lean();

      const eventIds = upcomingEvents.map(e => e._id);
      const courseIds = upcomingCourses.map(c => c._id);

      const registrations = await Registration.find({
        $or: [
          { event: { $in: eventIds } },
          { course: { $in: courseIds } }
        ]
      })
        .populate('user', '_id name email')
        .lean();

      users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
    }

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users for email:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get events and courses for reminder selection
router.get('/items-for-reminder', auth, adminAuth, async (req, res) => {
  try {
    const events = await Event.find().select('_id title date').lean();
    const courses = await Course.find().select('_id title').lean();

    res.json({ events, courses });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Send reminder email
router.post('/send-reminder',
  auth,
  adminAuth,
  [
    body('reminderType').isIn(['event', 'course', 'general']),
    body('itemId').optional().isMongoId(),
    body('userType').isIn(['all', 'event', 'course', 'upcoming']),
    body('customMessage').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { reminderType, itemId, userType, customMessage } = req.body;

      // Fetch users based on type
      let users = [];
      if (userType === 'all') {
        users = await User.find().select('_id name email').lean();
      } else if (userType === 'event') {
        const registrations = await Registration.find({ type: 'event' })
          .populate('user', '_id name email')
          .lean();
        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      } else if (userType === 'course') {
        const registrations = await Registration.find({ type: 'course' })
          .populate('user', '_id name email')
          .lean();
        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      } else if (userType === 'upcoming') {
        const now = new Date();
        const upcomingEvents = await Event.find({ date: { $gte: now } }).select('_id').lean();
        const upcomingCourses = await Course.find({ status: 'upcoming' }).select('_id').lean();

        const eventIds = upcomingEvents.map(e => e._id);
        const courseIds = upcomingCourses.map(c => c._id);

        const registrations = await Registration.find({
          $or: [
            { event: { $in: eventIds } },
            { course: { $in: courseIds } }
          ]
        })
          .populate('user', '_id name email')
          .lean();

        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      }

      if (users.length === 0) {
        return res.status(400).json({ error: 'No users found for this reminder' });
      }

      // Get item details if specific item is selected
      let itemDetails = {};
      if (itemId && reminderType !== 'general') {
        if (reminderType === 'event') {
          const event = await Event.findById(itemId).lean();
          itemDetails = event || {};
        } else if (reminderType === 'course') {
          const course = await Course.findById(itemId).lean();
          itemDetails = course || {};
        }
      }

      // Generate email template
      if (reminderType === 'general') {
        itemDetails.message = customMessage || 'This is an important reminder from PAIE Cell.';
      }

      const emailTemplate = getReminderEmailTemplate(reminderType, itemDetails);
      const subject = reminderType === 'general' 
        ? 'Important Reminder from PAIE Cell'
        : `Reminder: ${itemDetails.title || 'Event/Course'}`;

      // Send bulk emails
      const results = await sendBulkEmails(users, subject, emailTemplate);

      res.json({
        success: true,
        message: `Reminder sent successfully`,
        results
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      res.status(500).json({ error: error.message || 'Failed to send reminder' });
    }
  }
);

// Send custom email (both /send-custom and /send-custom-email for compatibility)
router.post('/send-custom',
  auth,
  adminAuth,
  [
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('userType').isIn(['all', 'students', 'facilitators', 'event', 'course', 'upcoming'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subject, message, userType } = req.body;

      // Fetch users based on type
      let users = [];
      if (userType === 'all') {
        users = await User.find().select('_id name email').lean();
      } else if (userType === 'students') {
        users = await User.find({ role: 'student' }).select('_id name email').lean();
      } else if (userType === 'facilitators') {
        users = await User.find({ role: 'facilitator' }).select('_id name email').lean();
      } else if (userType === 'event') {
        const registrations = await Registration.find({ type: 'event' })
          .populate('user', '_id name email')
          .lean();
        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      } else if (userType === 'course') {
        const registrations = await Registration.find({ type: 'course' })
          .populate('user', '_id name email')
          .lean();
        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      } else if (userType === 'upcoming') {
        const now = new Date();
        const upcomingEvents = await Event.find({ date: { $gte: now } }).select('_id').lean();
        const upcomingCourses = await Course.find({ status: 'upcoming' }).select('_id').lean();

        const eventIds = upcomingEvents.map(e => e._id);
        const courseIds = upcomingCourses.map(c => c._id);

        const registrations = await Registration.find({
          $or: [
            { event: { $in: eventIds } },
            { course: { $in: courseIds } }
          ]
        })
          .populate('user', '_id name email')
          .lean();

        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      }

      if (users.length === 0) {
        return res.status(400).json({ error: 'No users found for this email' });
      }

      // Format message as HTML
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi [USER_NAME],</p>
          ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
          <p>Best regards,<br/>PAIE Cell</p>
        </div>
      `;

      // Send bulk emails
      const results = await sendBulkEmails(users, subject, htmlMessage);

      res.json({
        success: true,
        message: 'Custom email sent successfully',
        results
      });
    } catch (error) {
      console.error('Error sending custom email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  }
);

// Send custom email (alias for compatibility)
router.post('/send-custom-email',
  auth,
  adminAuth,
  [
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('userType').isIn(['all', 'students', 'facilitators', 'event', 'course', 'upcoming'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subject, message, userType } = req.body;

      // Fetch users based on type
      let users = [];
      if (userType === 'all') {
        users = await User.find().select('_id name email').lean();
      } else if (userType === 'event') {
        const registrations = await Registration.find({ type: 'event' })
          .populate('user', '_id name email')
          .lean();
        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      } else if (userType === 'course') {
        const registrations = await Registration.find({ type: 'course' })
          .populate('user', '_id name email')
          .lean();
        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      } else if (userType === 'upcoming') {
        const now = new Date();
        const upcomingEvents = await Event.find({ date: { $gte: now } }).select('_id').lean();
        const upcomingCourses = await Course.find({ status: 'upcoming' }).select('_id').lean();

        const eventIds = upcomingEvents.map(e => e._id);
        const courseIds = upcomingCourses.map(c => c._id);

        const registrations = await Registration.find({
          $or: [
            { event: { $in: eventIds } },
            { course: { $in: courseIds } }
          ]
        })
          .populate('user', '_id name email')
          .lean();

        users = [...new Map(registrations.map(r => [r.user._id, r.user])).values()];
      }

      if (users.length === 0) {
        return res.status(400).json({ error: 'No users found for this email' });
      }

      // Format message as HTML
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi [USER_NAME],</p>
          ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
          <p>Best regards,<br/>PAIE Cell</p>
        </div>
      `;

      // Send bulk emails
      const results = await sendBulkEmails(users, subject, htmlMessage);

      res.json({
        success: true,
        message: 'Custom email sent successfully',
        results
      });
    } catch (error) {
      console.error('Error sending custom email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  }
);

export default router;
