// Simple in-memory rate limiter
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) {
      requestCounts.delete(key);
    }
  }
}, 300000);

export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    const data = requestCounts.get(identifier);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }
    
    if (data.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
      });
    }
    
    data.count++;
    next();
  };
};

// Stricter rate limit for auth endpoints
export const authRateLimiter = rateLimiter(30, 60000); // 30 requests per minute

// Standard rate limit for API endpoints
export const apiRateLimiter = rateLimiter(100, 60000); // 100 requests per minute
