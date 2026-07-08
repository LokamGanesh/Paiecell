import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Course from '../models/Course.js';
import { sendBulkEmails, getReminderEmailTemplate, getCustomEmailTemplate } from '../utils/emailService.js';

const router = express.Router();

// ── Shared helper ─────────────────────────────────────────────────────────────
async function resolveUsers(userType, userIds = []) {
  if (userType === 'custom') {
    if (!userIds || userIds.length === 0) return [];
    return User.find({ _id: { $in: userIds } }).select('_id name email').lean();
  }
  if (userType === 'all') {
    return User.find().select('_id name email').lean();
  }
  if (userType === 'students') {
    return User.find({ role: 'student' }).select('_id name email').lean();
  }
  if (userType === 'facilitators') {
    return User.find({ role: 'facilitator' }).select('_id name email').lean();
  }
  if (userType === 'event') {
    const regs = await Registration.find({ type: 'event' })
      .populate('user', '_id name email').lean();
    return [...new Map(regs.map(r => [String(r.user._id), r.user])).values()];
  }
  if (userType === 'course') {
    const regs = await Registration.find({ type: 'course' })
      .populate('user', '_id name email').lean();
    return [...new Map(regs.map(r => [String(r.user._id), r.user])).values()];
  }
  if (userType === 'upcoming') {
    const now = new Date();
    const upcomingEvents = await Event.find({ date: { $gte: now } }).select('_id').lean();
    const upcomingCourses = await Course.find({ status: 'upcoming' }).select('_id').lean();
    const regs = await Registration.find({
      $or: [
        { event: { $in: upcomingEvents.map(e => e._id) } },
        { course: { $in: upcomingCourses.map(c => c._id) } }
      ]
    }).populate('user', '_id name email').lean();
    return [...new Map(regs.map(r => [String(r.user._id), r.user])).values()];
  }
  return [];
}

// ── GET /users-for-email ──────────────────────────────────────────────────────
router.get('/users-for-email', auth, adminAuth, async (req, res) => {
  try {
    const { type } = req.query;
    const users = await resolveUsers(type || 'all');
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users for email:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── GET /items-for-reminder ───────────────────────────────────────────────────
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

// ── POST /send-reminder ───────────────────────────────────────────────────────
router.post(
  '/send-reminder',
  auth,
  adminAuth,
  [
    body('reminderType').isIn(['event', 'course', 'general']),
    body('itemId').optional().isMongoId(),
    body('userType').isIn(['all', 'students', 'facilitators', 'event', 'course', 'upcoming', 'custom']),
    body('userIds').optional().isArray(),
    body('customMessage').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { reminderType, itemId, userType, userIds, customMessage } = req.body;

      const users = await resolveUsers(userType, userIds);
      if (users.length === 0) {
        return res.status(400).json({ error: 'No users found for this reminder' });
      }

      let itemDetails = {};
      if (itemId && reminderType !== 'general') {
        if (reminderType === 'event') {
          itemDetails = (await Event.findById(itemId).lean()) || {};
        } else {
          itemDetails = (await Course.findById(itemId).lean()) || {};
        }
      }

      if (reminderType === 'general') {
        itemDetails.message = customMessage || 'This is an important reminder from PAIE Cell.';
      }

      const emailTemplate = getReminderEmailTemplate(reminderType, itemDetails);
      const subject =
        reminderType === 'general'
          ? 'Important Reminder from PAIE Cell'
          : `Reminder: ${itemDetails.title || 'Upcoming Event/Course'}`;

      const results = await sendBulkEmails(users, subject, emailTemplate);
      res.json({ success: true, message: 'Reminder sent successfully', results });
    } catch (error) {
      console.error('Error sending reminder:', error);
      res.status(500).json({ error: error.message || 'Failed to send reminder' });
    }
  }
);

// ── POST /send-custom ─────────────────────────────────────────────────────────
router.post(
  '/send-custom',
  auth,
  adminAuth,
  [
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('userType').isIn(['all', 'students', 'facilitators', 'event', 'course', 'upcoming', 'custom']),
    body('userIds').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subject, message, userType, userIds } = req.body;

      const users = await resolveUsers(userType, userIds);
      if (users.length === 0) {
        return res.status(400).json({ error: 'No users found for this email' });
      }

      const htmlMessage = getCustomEmailTemplate(message);
      const results = await sendBulkEmails(users, subject, htmlMessage);
      res.json({ success: true, message: 'Custom email sent successfully', results });
    } catch (error) {
      console.error('Error sending custom email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  }
);

// ── POST /send-custom-email (alias) ───────────────────────────────────────────
router.post(
  '/send-custom-email',
  auth,
  adminAuth,
  [
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('userType').isIn(['all', 'students', 'facilitators', 'event', 'course', 'upcoming', 'custom']),
    body('userIds').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subject, message, userType, userIds } = req.body;

      const users = await resolveUsers(userType, userIds);
      if (users.length === 0) {
        return res.status(400).json({ error: 'No users found for this email' });
      }

      const htmlMessage = getCustomEmailTemplate(message);
      const results = await sendBulkEmails(users, subject, htmlMessage);
      res.json({ success: true, message: 'Custom email sent successfully', results });
    } catch (error) {
      console.error('Error sending custom email:', error);
      res.status(500).json({ error: error.message || 'Failed to send email' });
    }
  }
);

export default router;
