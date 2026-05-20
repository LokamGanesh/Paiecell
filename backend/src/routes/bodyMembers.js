import express from 'express';
import multer from 'multer';
import BodyMember from '../models/BodyMember.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { deleteFromCloudinary } from '../utils/cloudinaryService.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowed.test(ext) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const uploadMemberPhoto = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'paiecell/body-members',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// GET all active body members (public)
router.get('/', async (req, res) => {
  try {
    const members = await BodyMember.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all body members including inactive (admin only)
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const members = await BodyMember.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create body member with optional photo upload
router.post('/', auth, adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const { name, role, department, year, bio, order } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    let imageUrl = null;
    let publicId = null;

    if (req.file) {
      const result = await uploadMemberPhoto(req.file.buffer, req.file.originalname);
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const member = new BodyMember({
      name,
      role,
      department,
      year,
      bio,
      imageUrl,
      publicId,
      order: order ? parseInt(order) : 0,
      isActive: true
    });

    await member.save();
    res.status(201).json({ member });
  } catch (error) {
    console.error('Create body member error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update body member
router.put('/:id', auth, adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, year, bio, order, isActive } = req.body;

    const member = await BodyMember.findById(id);
    if (!member) {
      return res.status(404).json({ error: 'Body member not found' });
    }

    if (req.file) {
      // Delete old photo from Cloudinary if exists
      if (member.publicId) {
        try {
          await deleteFromCloudinary(member.publicId, 'image');
        } catch (e) {
          console.error('Failed to delete old photo:', e);
        }
      }
      const result = await uploadMemberPhoto(req.file.buffer, req.file.originalname);
      member.imageUrl = result.secure_url;
      member.publicId = result.public_id;
    }

    if (name !== undefined) member.name = name;
    if (role !== undefined) member.role = role;
    if (department !== undefined) member.department = department;
    if (year !== undefined) member.year = year;
    if (bio !== undefined) member.bio = bio;
    if (order !== undefined) member.order = parseInt(order);
    if (isActive !== undefined) member.isActive = isActive === 'true' || isActive === true;

    await member.save();
    res.json({ member });
  } catch (error) {
    console.error('Update body member error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE body member
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const member = await BodyMember.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({ error: 'Body member not found' });
    }

    if (member.publicId) {
      try {
        await deleteFromCloudinary(member.publicId, 'image');
      } catch (e) {
        console.error('Failed to delete photo from Cloudinary:', e);
      }
    }

    res.json({ message: 'Body member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
