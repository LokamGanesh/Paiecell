import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { generateCSV, generateExcel, formatUserData, formatRegistrationData } from '../utils/exportUtils.js';

const router = express.Router();

// Export users as CSV
router.get('/users/csv', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const formattedData = formatUserData(users);
    const csv = generateCSV(formattedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export users as Excel
router.get('/users/excel', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const formattedData = formatUserData(users);
    const buffer = await generateExcel(formattedData, 'users.xlsx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Export registrations as CSV
router.get('/registrations/csv', auth, adminAuth, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name email phone')
      .populate('event', 'title')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    const formattedData = formatRegistrationData(registrations);
    const csv = generateCSV(formattedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export registrations as Excel
router.get('/registrations/excel', auth, adminAuth, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name email phone')
      .populate('event', 'title')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    const formattedData = formatRegistrationData(registrations);
    const buffer = await generateExcel(formattedData, 'registrations.xlsx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Export specific event registrations as CSV
router.get('/event/:eventId/csv', auth, adminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId, type: 'event' })
      .populate('user', 'name email phone college department year')
      .populate('event', 'title date')
      .sort({ createdAt: -1 });

    const formattedData = formatRegistrationData(registrations);
    const csv = generateCSV(formattedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="event-registrations.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export specific event registrations as Excel
router.get('/event/:eventId/excel', auth, adminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId, type: 'event' })
      .populate('user', 'name email phone college department year')
      .populate('event', 'title date')
      .sort({ createdAt: -1 });

    const formattedData = formatRegistrationData(registrations);
    const buffer = await generateExcel(formattedData, 'event-registrations.xlsx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="event-registrations.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Export specific course registrations as CSV
router.get('/course/:courseId/csv', auth, adminAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const registrations = await Registration.find({ course: courseId, type: 'course' })
      .populate('user', 'name email phone college department year')
      .populate('course', 'title duration')
      .sort({ createdAt: -1 });

    const formattedData = formatRegistrationData(registrations);
    const csv = generateCSV(formattedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="course-registrations.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export specific course registrations as Excel
router.get('/course/:courseId/excel', auth, adminAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const registrations = await Registration.find({ course: courseId, type: 'course' })
      .populate('user', 'name email phone college department year')
      .populate('course', 'title duration')
      .sort({ createdAt: -1 });

    const formattedData = formatRegistrationData(registrations);
    const buffer = await generateExcel(formattedData, 'course-registrations.xlsx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="course-registrations.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

export default router;
