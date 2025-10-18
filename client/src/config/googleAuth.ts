// Import Google Auth types
import { GoogleAuthResponse } from '../types/googleAuth';

// Google OAuth Configuration
export const GOOGLE_AUTH_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
  redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  scope: 'openid email profile'
};

// Google OAuth utility functions
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // Initialize Google Identity Services
  public async initializeGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Auth can only be used in browser environment'));
        return;
      }

      if (this.isInitialized) {
        resolve();
        return;
      }

      // Debug: Log the client ID being used
      console.log('🔑 Google Client ID:', GOOGLE_AUTH_CONFIG.clientId);
      console.log('🔗 Redirect URI:', GOOGLE_AUTH_CONFIG.redirectUri);

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        if (window.google) {
          console.log('✅ Google Identity Services loaded successfully');
          window.google.accounts.id.initialize({
            client_id: GOOGLE_AUTH_CONFIG.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
          });
          this.isInitialized = true;
          console.log('✅ Google Auth initialized');
          resolve();
        } else {
          console.error('❌ Google Identity Services failed to load');
          reject(new Error('Google Identity Services failed to load'));
        }
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  // Handle credential response
  private handleCredentialResponse(response: any): GoogleAuthResponse {
    // This will be called by Google's callback
    return {
      id: response.credential,
      name: response.name || '',
      email: response.email || '',
      imageUrl: response.picture || '',
      accessToken: response.credential,
      idToken: response.credential
    };
  }

  // Sign in with Google using popup
  public async signInWithGoogle(): Promise<GoogleAuthResponse> {
    if (!this.isInitialized) {
      await this.initializeGapi();
    }

    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      console.log('🚀 Starting Google OAuth flow...');
      console.log('🔑 Using Client ID:', GOOGLE_AUTH_CONFIG.clientId);
      console.log('📋 Scope:', GOOGLE_AUTH_CONFIG.scope);

      // Use the popup flow
      window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_AUTH_CONFIG.clientId,
        scope: GOOGLE_AUTH_CONFIG.scope,
        callback: (response: any) => {
          console.log('📨 OAuth response received:', response);
          
          if (response.error) {
            console.error('❌ OAuth error:', response.error);
            reject(new Error(response.error));
            return;
          }

          console.log('✅ Access token received, fetching user info...');

          // Get user info using the access token
          fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
            .then(res => res.json())
            .then(userInfo => {
              console.log('👤 User info received:', userInfo);
              resolve({
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                imageUrl: userInfo.picture,
                accessToken: response.access_token,
                idToken: response.access_token
              });
            })
            .catch(error => {
              console.error('❌ Error fetching user info:', error);
              reject(error);
            });
        }
      }).requestAccessToken();
    });
  }

  // Sign out from Google
  public async signOut(): Promise<void> {
    if (window.google && window.google.accounts) {
      window.google.accounts.oauth2.revoke();
    }
  }

  // Check if user is signed in
  public async isSignedIn(): Promise<boolean> {
    // For simplicity, we'll assume user is not signed in
    // In a real app, you'd check localStorage or cookies
    return false;
  }

  // Get current user
  public async getCurrentUser(): Promise<GoogleAuthResponse | null> {
    // For simplicity, return null
    // In a real app, you'd retrieve from localStorage or cookies
    return null;
  }
}

// Export singleton instance
export const googleAuthService = GoogleAuthService.getInstance();
