import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register (Student only - public registration)
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('college').trim().notEmpty(),
    body('department').isIn(['AIDS', 'AIML', 'CSE', 'CSD', 'CIC', 'CSB', 'SCS', 'IT', 'ITC', 'CIVIL', 'MECH', 'ECE', 'EEE']),
    body('year').isIn(['1st Year', '2nd Year', '3rd Year', '4th Year'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name, phone, college, department, year } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Force student role for public registration
      const userData = { 
        email, 
        password, 
        name,
        phone,
        college,
        department,
        year,
        role: 'student',
        userType: 'student'
      };

      const user = await User.create(userData);
      const token = generateToken(user._id);

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          college: user.college,
          department: user.department,
          year: user.year,
          role: user.role,
          userType: user.userType
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  [
    body('identifier').notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { identifier, password } = req.body;

      // Check if identifier is email or phone
      const isEmail = identifier.includes('@');
      const user = await User.findOne(
        isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }
      );

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user._id);

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          college: user.college,
          department: user.department,
          year: user.year,
          role: user.role,
          userType: user.userType,
          organization: user.organization
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      phone: req.user.phone,
      college: req.user.college,
      department: req.user.department,
      year: req.user.year,
      role: req.user.role,
      userType: req.user.userType,
      organization: req.user.organization
    }
  });
});

// Forgot password - request reset
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if user exists
        return res.json({ message: 'If an account exists, a reset link has been sent to your email.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // In production, send email here
      // For now, return the token (in production, this should be sent via email)
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      
      console.log('Password reset URL:', resetUrl);
      
      res.json({ 
        message: 'If an account exists, a reset link has been sent to your email.',
        // Remove this in production - only for development
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Reset password
router.post('/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
