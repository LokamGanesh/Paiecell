import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update own profile (authenticated users)
router.put('/profile',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('college').optional().trim(),
    body('department').optional().trim(),
    body('year').optional().trim(),
    body('organization').optional().trim(),
    body('currentPassword').optional().isLength({ min: 6 }),
    body('newPassword').optional().isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { name, phone, college, department, year, organization, currentPassword, newPassword } = req.body;

      // Update basic fields
      if (name) user.name = name;
      if (phone) user.phone = phone;
      
      // Update role-specific fields
      if (user.role === 'student') {
        if (college) user.college = college;
        if (department) user.department = department;
        if (year) user.year = year;
      } else if (user.role === 'facilitator' || user.userType === 'corporate') {
        if (organization) user.organization = organization;
      }

      // Handle password change
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        user.password = newPassword; // Will be hashed by pre-save hook
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          userType: user.userType,
          college: user.college,
          department: user.department,
          year: user.year,
          organization: user.organization
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Create user (admin only - for facilitators/corporate/admins)
router.post('/',
  auth,
  adminAuth,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('role').isIn(['facilitator', 'admin']),
    body('userType').optional().isIn(['corporate', 'partner', 'student']),
    body('organization').optional().trim(),
    body('college').optional().trim(),
    body('department').optional().trim(),
    body('year').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name, phone, role, userType, organization, college, department, year } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const userData = {
        email,
        password,
        name,
        phone,
        role,
        userType: userType || 'corporate',
        ...(organization && { organization }),
        ...(college && { college }),
        ...(department && { department }),
        ...(year && { year })
      };

      const user = await User.create(userData);

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          userType: user.userType,
          organization: user.organization,
          college: user.college,
          department: user.department,
          year: user.year
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (admin only)
router.patch('/:id/role',
  auth,
  adminAuth,
  [body('role').isIn(['student', 'facilitator', 'admin'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.role = req.body.role;
      await user.save();

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
