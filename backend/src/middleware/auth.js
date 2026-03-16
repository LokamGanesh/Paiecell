import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Simple in-memory cache for user data (TTL: 5 minutes)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCachedUser = (userId) => {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  userCache.delete(userId);
  return null;
};

const setCachedUser = (userId, userData) => {
  userCache.set(userId, {
    data: userData,
    timestamp: Date.now()
  });
};

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check cache first
    let user = getCachedUser(decoded.id);
    
    if (!user) {
      user = await User.findById(decoded.id).select('-password').lean();
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      setCachedUser(decoded.id, user);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

export const facilitatorAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Facilitator access required' });
    }
    next();
  } catch (error) {
    console.error('Facilitator auth error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

export const studentAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Student access required' });
    }
    next();
  } catch (error) {
    console.error('Student auth error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};
