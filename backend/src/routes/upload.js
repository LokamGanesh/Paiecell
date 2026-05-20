import express from 'express';
import multer from 'multer';
import { auth, adminAuth } from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryService.js';

const router = express.Router();

// Use memory storage - files go to Cloudinary, not disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  const isImage = allowedImageTypes.test(ext) && allowedImageTypes.test(file.mimetype);
  const isVideo = allowedVideoTypes.test(ext);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only image (jpeg, jpg, png, gif, webp) and video (mp4, mov, avi, mkv, webm) files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter
});

// Upload single image → Cloudinary paiecell/gallery/events or courses
router.post('/image', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.body.type === 'course' ? 'courses' : 'events';
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, type);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload media (image or video) → Cloudinary
router.post('/media', auth, adminAuth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.body.type === 'course' ? 'courses' : 'events';
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, type);

    res.json({
      message: 'Media uploaded successfully',
      mediaUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Delete image/media from Cloudinary
router.delete('/image/:publicId(*)', auth, adminAuth, async (req, res) => {
  try {
    const publicId = req.params.publicId;
    await deleteFromCloudinary(publicId);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Delete by URL (extracts public_id automatically)
router.delete('/by-url', auth, adminAuth, async (req, res) => {
  try {
    const { url, resourceType } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return res.status(400).json({ error: 'Could not extract public ID from URL' });

    await deleteFromCloudinary(publicId, resourceType || 'image');
    res.json({ message: 'Media deleted successfully', publicId });
  } catch (error) {
    console.error('Delete by URL error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

export default router;
