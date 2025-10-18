# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)

## 2. Environment Variables

Add these to your `.env` file in the server directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

Add these to your `.env` file in the client directory:

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 3. Features Included

- ✅ Google Sign-In for Login
- ✅ Google Sign-In for Registration
- ✅ Automatic user profile creation
- ✅ Email verification bypass for Google users
- ✅ Avatar image from Google profile
- ✅ Secure token verification

## 4. Testing

1. Start both client and server
2. Go to `/login` or `/register`
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. User will be automatically logged in

## 5. Security Notes

- Google ID tokens are verified on the server
- User data is validated before account creation
- Existing users can link their Google account
- All OAuth flows are secure and follow best practices
