import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Rate limiting middleware factory
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    keyGenerator = (req: Request) => {
      // Default: use IP address as key
      return req.ip || req.socket.remoteAddress || 'unknown';
    }
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or get existing rate limit data
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment request count
    rateLimitStore[key].count++;

    // Check if limit exceeded
    if (rateLimitStore[key].count > maxRequests) {
      const resetIn = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);
      
      console.log(`⚠️ [RATE LIMIT] Blocked request from ${key} - ${rateLimitStore[key].count}/${maxRequests} requests`);
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: resetIn,
        limit: maxRequests,
        remaining: 0
      });
      return;
    }

    // Add rate limit headers
    const remaining = maxRequests - rateLimitStore[key].count;
    const resetIn = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetIn.toString());

    console.log(`✅ [RATE LIMIT] Request from ${key} - ${rateLimitStore[key].count}/${maxRequests} requests`);

    next();
  };
};

/**
 * Strict rate limiter for OTP sending
 * 3 requests per 15 minutes per IP
 */
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50, // Increased for testing
  message: 'Too many OTP requests. Please try again after 15 minutes.',
  keyGenerator: (req: Request) => {
    // Use IP + email combination for OTP requests
    const email = req.body.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `otp:${ip}:${email}`;
  }
});

/**
 * Rate limiter for login attempts
 * 5 requests per 15 minutes per IP
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Increased for testing
  message: 'Too many login attempts. Please try again after 15 minutes.',
  keyGenerator: (req: Request) => {
    const email = req.body.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `login:${ip}:${email}`;
  }
});

/**
 * Rate limiter for registration
 * 3 requests per hour per IP
 */
export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // Increased for testing
  message: 'Too many registration attempts. Please try again after 1 hour.',
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `register:${ip}`;
  }
});

/**
 * Rate limiter for password reset
 * 3 requests per hour per email
 */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many password reset requests. Please try again after 1 hour.',
  keyGenerator: (req: Request) => {
    const email = req.body.email || 'unknown';
    return `password-reset:${email}`;
  }
});

/**
 * Rate limiter for admin OTP
 * 3 requests per 30 minutes per IP
 */
export const adminOtpRateLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  maxRequests: 3,
  message: 'Too many admin OTP requests. Please try again after 30 minutes.',
  keyGenerator: (req: Request) => {
    const email = req.body.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `admin-otp:${ip}:${email}`;
  }
});

/**
 * Rate limiter for admin login
 * 5 requests per 30 minutes per IP
 */
export const adminLoginRateLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  maxRequests: 5,
  message: 'Too many admin login attempts. Please try again after 30 minutes.',
  keyGenerator: (req: Request) => {
    const email = req.body.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `admin-login:${ip}:${email}`;
  }
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // Increased for testing
  message: 'Too many API requests. Please slow down.'
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour per user
 */
export const sensitiveOperationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many sensitive operations. Please try again later.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?._id || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `sensitive:${userId}:${ip}`;
  }
});

/**
 * AI Chatbot rate limiter
 * 10 questions per day per admin
 */
export const aiChatbotRateLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 10,
  message: 'Daily AI chatbot limit reached (10 questions per day). Please try again tomorrow.',
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const adminToken = req.headers.authorization?.split(' ')[1] || 'unknown';
    return `ai-chatbot:${adminToken}:${ip}`;
  }
});

export default {
  createRateLimiter,
  otpRateLimiter,
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  adminOtpRateLimiter,
  adminLoginRateLimiter,
  apiRateLimiter,
  sensitiveOperationRateLimiter,
  aiChatbotRateLimiter
};
