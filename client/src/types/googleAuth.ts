// Google API Type Definitions
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
          revoke: () => void;
        };
      };
    };
  }
}

export interface GoogleAuthResponse {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  accessToken: string;
  idToken: string;
}
