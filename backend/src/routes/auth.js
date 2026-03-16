import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';
import { initiatePayment, verifyPayment } from '../utils/phonePeService.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
      let { email, password, name, phone, college, department, year } = req.body;

      // Format phone number - add +91 if not present
      phone = phone.replace(/\D/g, '');
      if (phone.length === 10) {
        phone = '+91' + phone;
      } else if (!phone.startsWith('+91')) {
        return res.status(400).json({ error: 'Invalid phone number. Please enter a 10-digit number.' });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create temporary user object for payment initiation (not saved to DB yet)
      const tempUserData = {
        email,
        name,
        phone,
        college,
        department,
        year,
        password
      };

      try {
        // Initiate PhonePe payment with temporary data
        const paymentResponse = await initiatePayment(tempUserData, 100);

        // Extract payment URL from response
        const paymentUrl = paymentResponse.data?.data?.instrumentResponse?.redirectUrl;
        
        if (!paymentUrl) {
          console.error('Payment URL not found in response:', paymentResponse.data);
          return res.status(500).json({ error: 'Failed to get payment URL. Please try again.' });
        }

        // Return payment URL without creating user in DB
        res.status(200).json({
          success: true,
          message: 'Payment gateway initiated. Complete payment to register.',
          paymentUrl,
          merchantTransactionId: paymentResponse.merchantTransactionId,
          userData: tempUserData
        });
      } catch (paymentError) {
        console.error('PhonePe payment error:', paymentError.message);
        
        // Fallback: If PhonePe fails, return a test payment URL
        if (process.env.NODE_ENV === 'development') {
          const merchantTransactionId = `PAIE_${Date.now()}_${email.split('@')[0]}`;
          res.status(200).json({
            success: true,
            message: 'Payment gateway initiated (Test Mode). Complete payment to register.',
            paymentUrl: `${process.env.FRONTEND_URL}/payment-callback?transactionId=${merchantTransactionId}&test=true`,
            merchantTransactionId,
            userData: tempUserData,
            testMode: true
          });
        } else {
          res.status(500).json({ error: 'Failed to initiate payment. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process registration. Please try again.'
      });
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

// Forgot password - request OTP
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
        return res.status(404).json({ error: 'Email not found. Please check and try again.' });
      }

      // Generate OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = Date.now() + 600000; // 10 minutes
      user.otpAttempts = 0;
      await user.save();

      // Send OTP via email
      const emailTemplate = `
        <h2>Password Reset OTP</h2>
        <p>Hi ${user.name},</p>
        <p>Your OTP for password reset is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br/>PAIE Cell</p>
      `;

      try {
        await sendEmail(email, 'Password Reset OTP', emailTemplate);
        console.log(`OTP sent successfully to ${email}`);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // In development, still return success but log the OTP
        if (process.env.NODE_ENV === 'development') {
          console.log('OTP for development:', otp);
        } else {
          return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }
      }

      res.json({ 
        message: 'OTP has been sent to your email.',
        // Only for development
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Verify OTP
router.post('/verify-otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Check if OTP is expired
      if (!user.otpExpires || Date.now() > user.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      // Check attempts
      if (user.otpAttempts >= 5) {
        return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
      }

      // Verify OTP
      if (user.otp !== otp) {
        user.otpAttempts += 1;
        await user.save();
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // OTP verified - generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 1800000; // 30 minutes
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();

      res.json({ 
        message: 'OTP verified successfully',
        resetToken
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Reset password with token
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

// Resend OTP
router.post('/resend-otp',
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
        return res.status(404).json({ error: 'Email not found. Please check and try again.' });
      }

      // Generate new OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = Date.now() + 600000; // 10 minutes
      user.otpAttempts = 0;
      await user.save();

      // Send OTP via email
      const emailTemplate = `
        <h2>Password Reset OTP</h2>
        <p>Hi ${user.name},</p>
        <p>Your new OTP for password reset is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br/>PAIE Cell</p>
      `;

      try {
        await sendEmail(email, 'Password Reset OTP', emailTemplate);
        console.log(`OTP resent successfully to ${email}`);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        if (process.env.NODE_ENV === 'development') {
          console.log('OTP for development:', otp);
        } else {
          return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }
      }

      res.json({ 
        message: 'A new OTP has been sent to your email.',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Payment callback endpoint
router.post('/payment-callback', async (req, res) => {
  try {
    const { merchantTransactionId, userData, testMode } = req.body;

    if (!merchantTransactionId || !userData) {
      return res.status(400).json({ error: 'Invalid payment session' });
    }

    let paymentVerification;

    // In test mode, skip PhonePe verification
    if (testMode) {
      paymentVerification = {
        success: true,
        data: {
          success: true,
          data: {
            transactionId: merchantTransactionId,
            amount: 10000 // 100 rupees in paise
          }
        }
      };
    } else {
      // Verify payment with PhonePe
      paymentVerification = await verifyPayment(merchantTransactionId);
    }

    if (paymentVerification.success && paymentVerification.data.success) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user only after successful payment
      const newUser = await User.create({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        college: userData.college,
        department: userData.department,
        year: userData.year,
        role: 'student',
        userType: 'student',
        paymentStatus: 'completed',
        isPaymentVerified: true,
        transactionId: merchantTransactionId,
        paymentId: paymentVerification.data.data.transactionId,
        paymentAmount: paymentVerification.data.data.amount / 100
      });

      // Generate token for the user
      const token = generateToken(newUser._id);

      // Send welcome email
      const emailTemplate = `
        <h2>Welcome to PAIE Cell!</h2>
        <p>Hi ${newUser.name},</p>
        <p>Your registration has been completed successfully!</p>
        <p><strong>Transaction ID:</strong> ${merchantTransactionId}</p>
        <p>You can now login to your account and explore all the amazing events and courses.</p>
        <p>Best regards,<br/>PAIE Cell Team</p>
      `;

      try {
        await sendEmail(newUser.email, 'Registration Successful - Welcome to PAIE Cell', emailTemplate);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      return res.json({
        success: true,
        message: 'Payment verified and registration completed',
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          college: newUser.college,
          department: newUser.department,
          year: newUser.year,
          role: newUser.role,
          userType: newUser.userType
        },
        token
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Please try again.'
      });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Server error during payment verification' });
  }
});

// Check payment status endpoint
router.get('/payment-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const paymentVerification = await verifyPayment(transactionId);

    res.json({
      success: paymentVerification.success,
      data: paymentVerification.data
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

export default router;
