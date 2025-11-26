/**
 * Utility functions for JWT token validation
 */

interface DecodedToken {
  id: string;
  email: string;
  role?: string;
  type?: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This only decodes the payload, it doesn't verify the signature
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get time until token expiration in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const currentTime = Date.now() / 1000;
  const timeUntilExpiration = (decoded.exp - currentTime) * 1000;
  return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
};

/**
 * Validate admin token and return whether it's valid
 */
export const validateAdminToken = (token: string | null): boolean => {
  if (!token) {
    console.log('❌ [TOKEN] No token provided');
    return false;
  }

  if (isTokenExpired(token)) {
    console.log('❌ [TOKEN] Token has expired');
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    console.log('❌ [TOKEN] Invalid token format');
    return false;
  }

  if (decoded.type !== 'admin') {
    console.log('❌ [TOKEN] Token is not an admin token');
    return false;
  }

  console.log('✅ [TOKEN] Token is valid');
  return true;
};

/**
 * Clear expired tokens from localStorage
 */
export const clearExpiredTokens = (): void => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken && isTokenExpired(adminToken)) {
    console.log('🧹 [TOKEN] Clearing expired admin token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  }

  // accessToken is now stored in HTTP-only cookie, so we don't need to clear it from localStorage
  // const accessToken = localStorage.getItem('accessToken');
  // if (accessToken && isTokenExpired(accessToken)) {
  //   console.log('🧹 [TOKEN] Clearing expired access token');
  //   localStorage.removeItem('accessToken');
  // }
};
