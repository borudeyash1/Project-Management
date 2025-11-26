import { Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const setCookieToken = (res: Response, name: string, value: string, maxAge: number) => {
    res.cookie(name, value, {
        httpOnly: true,           // Prevents XSS attacks
        secure: isProduction,     // HTTPS only in production
        sameSite: 'lax',          // CSRF protection (lax allows navigation)
        domain: isProduction ? '.sartthi.com' : undefined, // Share across subdomains in production
        maxAge: maxAge,           // Expiry time in milliseconds
        path: '/',                // Available on all paths
    });
};

export const clearCookieToken = (res: Response, name: string) => {
    res.clearCookie(name, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        domain: isProduction ? '.sartthi.com' : undefined,
        path: '/',
    });
};

export const getTokenFromCookie = (req: any, name: string): string | undefined => {
    return req.cookies?.[name];
};
