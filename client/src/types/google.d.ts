declare global {
  namespace google {
    namespace accounts {
      namespace id {
        interface CredentialResponse {
          credential: string;
          select_by:
            | 'auto'
            | 'user'
            | 'apps'
            | 'browser'
            | 'account_chooser'
            | 'tap_inside'
            | 'tap_outside'
            | 'btn'
            | 'btn_confirm'
            | 'invalid_idp_response'
            | 'federated_callback'
            | 'code_response'
            | 'cancel_called'
            | 'flow_restarted'
            | 'unknown';
          client_id: string;
          hd?: string;
          nonce?: string;
        }

        interface IdConfiguration {
          client_id: string;
          callback: (response: CredentialResponse) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
          prompt_parent_id?: string;
          native_callback?: (response: CredentialResponse) => void;
          context?: 'signin' | 'signup' | 'use';
          ux_mode?: 'popup' | 'redirect';
          login_uri?: string;
          nonce?: string;
          allowed_parent_origin?: string;
          intermediate_iframes_close_delay?: number;
          hosted_domain?: string;
          logo_url?: string;
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'small' | 'medium' | 'large';
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
          type?: 'standard' | 'icon';
          width?: string;
          locale?: string;
          cancel_on_tap_outside_strict?: boolean;
        }

        interface PromptMomentNotification {
          getNotDisplayedReason: () => 'browser_not_supported' | 'terms_not_agreed' | 'zero_accounts' | 'suppressed_by_user' | 'cookie_disabled';
          getSkippedReason: () => 'user_cancel' | 'no_session_in_gpm' | 'unknown';
          getMomentType: () => 'display' | 'skipped' | 'dismissed';
          isDisplayed: () => boolean;
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
          isDismissedMoment: () => boolean;
        }

        interface Id {
          initialize: (config: IdConfiguration) => void;
          renderButton: (parent: HTMLElement, options: any) => void; // Simplified options
          prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
          disableAutoSelect: () => void;
        }

      }

      namespace oauth2 {
        interface TokenResponse {
          access_token: string;
          expires_in: number;
          hd?: string;
          prompt: string;
          scope: string;
          token_type: 'Bearer';
          error?: string;
          error_description?: string;
          error_uri?: string;
          state?: string;
        }

        interface TokenClientConfig {
          client_id: string;
          scope: string;
          callback: (tokenResponse: TokenResponse) => void;
          prompt?: string;
          error_popup?: boolean;
          state?: string;
          enable_granular_consent?: boolean;
          login_hint?: string;
          hd?: string;
          hosted_domain?: string;
          select_account?: 'enable_and_select' | 'enable_and_select_never' | 'never';
          ux_mode?: 'popup' | 'redirect';
          redirect_uri?: string;
        }

        interface TokenClient {
          requestAccessToken: (overrideConfig?: Omit<TokenClientConfig, 'client_id' | 'callback'>) => void;
        }

        interface OAuth2 {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          revoke: (accessToken: string, callback: () => void) => void;
        }
      }
    }
  }

  interface Window {
    google: {
      accounts: {
        id: google.accounts.id.Id;
        oauth2: google.accounts.oauth2.OAuth2;
      };
    };
  }
}

export {};
