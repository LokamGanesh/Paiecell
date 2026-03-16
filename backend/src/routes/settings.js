import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get YES+ link
router.get('/yesplus/link', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'yesplus_link' });
    const link = setting?.value || 'https://asplace.artofliving.org/register';
    res.json({ link });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch YES+ link' });
  }
});

// Get YES+ link (full-link alias for compatibility)
router.get('/yesplus/full-link', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'yesplus_link' });
    const link = setting?.value || 'https://asplace.artofliving.org/register';
    res.json({ link });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch YES+ link' });
  }
});

// Update YES+ link (admin only)
router.put('/yesplus/link', 
  auth, 
  adminAuth,
  [
    body('link').trim().notEmpty().isURL().withMessage('Valid URL required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { link } = req.body;

      await Settings.findOneAndUpdate(
        { key: 'yesplus_link' },
        { 
          value: link,
          updatedBy: req.user.id,
          description: 'YES+ registration link'
        },
        { upsert: true, new: true }
      );

      res.json({ 
        message: 'YES+ link updated successfully',
        link
      });
    } catch (error) {
      console.error('Settings update error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
);

export default router;
