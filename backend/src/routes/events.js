import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all events (public) with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find()
        .select('title description category date time venue image capacity registrationCount status')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments()
    ]);

    res.json({ 
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event (admin only)
router.post('/',
  auth,
  adminAuth,
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isIn(['Workshop', 'Seminar', 'Corporate', 'Cultural', 'Technical', 'Sports']),
    body('date').isISO8601(),
    body('time').trim().notEmpty(),
    body('venue').trim().notEmpty(),
    body('capacity').optional().isInt({ min: 0 }),
    body('isExternal').optional().isBoolean(),
    body('externalLink').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const eventData = {
        ...req.body,
        createdBy: req.user._id
      };

      const event = await Event.create(eventData);
      await event.populate('createdBy', 'name email');

      res.status(201).json({ event });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update event (admin only)
router.put('/:id',
  auth,
  adminAuth,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('category').optional().isIn(['Workshop', 'Seminar', 'Corporate', 'Cultural', 'Technical', 'Sports']),
    body('date').optional().isISO8601(),
    body('time').optional().trim().notEmpty(),
    body('venue').optional().trim().notEmpty(),
    body('capacity').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ event });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete event (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
