import express from 'express';
import Media from '../models/Media.js';
import Event from '../models/Event.js';
import Course from '../models/Course.js';
import { auth } from '../middleware/auth.js';
import { deleteFromCloudinary, getPublicIdFromUrl, fetchFromCloudinaryFolder } from '../utils/cloudinaryService.js';

const router = express.Router();

// Get all media from Cloudinary folder directly (events or courses)
// This shows images uploaded directly to Cloudinary, not just via the app
router.get('/cloudinary/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!['events', 'courses'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Use "events" or "courses"' });
    }

    const resources = await fetchFromCloudinaryFolder(type);
    res.json({ resources, type });
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch from Cloudinary' });
  }
});

// Get all media
router.get('/', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 }).lean();
    res.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get media by type (event or course)
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!['event', 'course'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    const media = await Media.find({ type }).sort({ createdAt: -1 }).lean();
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get media for specific item
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const media = await Media.find({ itemId }).sort({ createdAt: -1 }).lean();
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create media
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, itemId, mediaType, mediaUrl } = req.body;

    if (!title || !type || !itemId || !mediaType || !mediaUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['event', 'course'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    if (!['image', 'video'].includes(mediaType)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    // Verify item exists
    let itemTitle;
    if (type === 'event') {
      const event = await Event.findById(itemId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      itemTitle = event.title;
    } else {
      const course = await Course.findById(itemId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      itemTitle = course.title;
    }

    const media = new Media({
      title,
      description,
      type,
      itemId,
      itemTitle,
      mediaType,
      mediaUrl,
      publicId: req.body.publicId || null,
      createdBy: req.user.id
    });

    await media.save();
    res.status(201).json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update media
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, mediaType, mediaUrl } = req.body;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    if (title) media.title = title;
    if (description) media.description = description;
    if (mediaType) media.mediaType = mediaType;
    if (mediaUrl) media.mediaUrl = mediaUrl;

    await media.save();
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findByIdAndDelete(id);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete from Cloudinary
    try {
      const publicId = media.publicId || getPublicIdFromUrl(media.mediaUrl);
      if (publicId) {
        const resourceType = media.mediaType === 'video' ? 'video' : 'image';
        await deleteFromCloudinary(publicId, resourceType);
      }
    } catch (cloudinaryError) {
      console.error('Failed to delete from Cloudinary:', cloudinaryError);
      // Don't fail the request if Cloudinary delete fails
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
