import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiter for general API endpoints
 * Prevents brute force attacks and API abuse
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for authentication endpoints
 * Prevents brute force login attempts
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Rate limiter for project/resource access
 * Prevents enumeration attacks on ObjectIDs
 */
export const resourceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute
    message: {
        success: false,
        message: 'Too many requests, please slow down.'
    },
});

/**
 * Audit logging for security events
 */
interface SecurityEvent {
    type: 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_TOKEN' | 'SUSPICIOUS_ACTIVITY';
    userId?: string;
    resourceId?: string;
    resourceType?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        ...event
    };

    // Log to console (in production, send to logging service like Winston, Datadog, etc.)
    console.warn('[SECURITY EVENT]', JSON.stringify(logEntry, null, 2));

    // TODO: In production, send to:
    // - Database for audit trail
    // - Monitoring service (Datadog, Sentry, etc.)
    // - Alert system for critical events
}

/**
 * Middleware to log unauthorized access attempts
 */
export function auditUnauthorizedAccess(resourceType: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json.bind(res);

        res.json = function (body: any) {
            // If response is 403 or 404 with access denied message, log it
            if ((res.statusCode === 403 || res.statusCode === 404) &&
                (body.message?.includes('access denied') || body.message?.includes('not found'))) {

                logSecurityEvent({
                    type: 'UNAUTHORIZED_ACCESS',
                    userId: (req as any).user?._id,
                    resourceId: req.params.id || req.params.projectId || req.params.workspaceId,
                    resourceType,
                    ip: req.ip,
                    userAgent: req.get('user-agent'),
                    details: {
                        method: req.method,
                        path: req.path,
                        query: req.query
                    }
                });
            }

            return originalJson(body);
        };

        next();
    };
}

/**
 * Enhanced CORS configuration
 */
export const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        const allowedOrigins = [
            'https://sartthi.com',
            'https://www.sartthi.com',
            'http://localhost:3000', // For development
            'http://localhost:5173'  // For Vite dev server
        ];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (adjust as needed)
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );

    next();
}
