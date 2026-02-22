import express from 'express';
import { body, validationResult } from 'express-validator';
import Course from '../models/Course.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single course (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ course });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create course (admin only)
router.post('/',
  auth,
  adminAuth,
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isIn(['Technical', 'Soft Skills', 'Leadership', 'Career Development', 'Personal Growth']),
    body('duration').trim().notEmpty(),
    body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
    body('capacity').optional().isInt({ min: 0 }),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const courseData = {
        ...req.body,
        createdBy: req.user._id
      };

      const course = await Course.create(courseData);
      await course.populate('createdBy', 'name email');

      res.status(201).json({ course });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update course (admin only)
router.put('/:id',
  auth,
  adminAuth,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('category').optional().isIn(['Technical', 'Soft Skills', 'Leadership', 'Career Development', 'Personal Growth']),
    body('duration').optional().trim().notEmpty(),
    body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
    body('capacity').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ course });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete course (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
