// Import Google Auth types
// Force rebuild: 2023-10-27
import { GoogleAuthResponse } from '../types/googleAuth';

// Google OAuth Configuration
export const GOOGLE_AUTH_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '639767615042-n17bqv93icprl9snejn2ddj7o5db03qc.apps.googleusercontent.com',
  redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  scope: 'openid email profile'
};

// Google OAuth utility functions
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  // Promises for coordinating ID token reception
  private idTokenPromiseResolve: ((token: string) => void) | null = null;
  private idTokenPromiseReject: ((error: Error) => void) | null = null;

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

  // Handle credential response (for ID token)
  private handleCredentialResponse(response: google.accounts.id.CredentialResponse): void {
    console.log('Credential response received:', response);
    if (response.credential) {
      if (this.idTokenPromiseResolve) {
        this.idTokenPromiseResolve(response.credential);
        this.idTokenPromiseResolve = null;
        this.idTokenPromiseReject = null;
      }
    } else {
      if (this.idTokenPromiseReject) {
        this.idTokenPromiseReject(new Error('No ID credential received'));
        this.idTokenPromiseReject = null;
        this.idTokenPromiseResolve = null;
      }
    }
  }

  // Sign in with Google (using OAuth2 flow)
  public async signInWithGoogle(): Promise<GoogleAuthResponse> {
    if (!this.isInitialized) {
      await this.initializeGapi();
    }

    if (!window.google) {
      throw new Error('Google Identity Services not loaded');
    }

    try {
      console.log('🚀 Starting Google OAuth flow...');
      
      // Use OAuth2 flow to get access token
      const accessToken = await new Promise<string>((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_AUTH_CONFIG.clientId,
          scope: GOOGLE_AUTH_CONFIG.scope,
          callback: (response: google.accounts.oauth2.TokenResponse) => {
            if (response.error) {
              console.error('❌ OAuth error:', response.error);
              reject(new Error(response.error));
            } else {
              console.log('✅ Access token received:', response.access_token);
              resolve(response.access_token);
            }
          }
        });
        client.requestAccessToken();
      });

      if (!accessToken) {
        throw new Error('Failed to obtain access token');
      }

      // Fetch user info using the access token
      const userinfoRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      if (!userinfoRes.ok) {
        throw new Error(`Failed to fetch user info: ${userinfoRes.statusText}`);
      }
      const userInfo = await userinfoRes.json();
      console.log('👤 User info received:', userInfo);

      return {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        imageUrl: userInfo.picture,
        accessToken: accessToken,
        idToken: '' // We'll use access token for authentication
      };

    } catch (error: any) {
      console.error('❌ Error during Google sign-in process:', error);
      throw error;
    }
  }

  // Sign out from Google
  public async signOut(): Promise<void> {
    if (window.google && window.google.accounts) {
      // Note: oauth2.revoke requires the access token, which is not stored here
      // For a full logout, you'd also need to clear local session state
      // window.google.accounts.oauth2.revoke(accessToken, () => console.log('Token revoked'));
      console.log('Google sign-out initiated. No access token to revoke directly via client.');
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
