/**
 * Get the URL for a Sartthi ecosystem app based on the current environment
 * @param app - The app to get the URL for ('mail' | 'calendar' | 'vault')
 * @returns The full URL to the app
 */
export const getAppUrl = (app: 'mail' | 'calendar' | 'vault') => {
    if (process.env.NODE_ENV === 'production') {
        switch (app) {
            case 'mail':
                return 'https://mail.sartthi.com';
            case 'calendar':
                return 'https://calendar.sartthi.com';
            case 'vault':
                return 'https://vault.sartthi.com';
        }
    }

    // Development URLs
    switch (app) {
        case 'mail':
            return 'http://localhost:3001';
        case 'calendar':
            return 'http://localhost:3002';
        case 'vault':
            return 'http://localhost:3004';
    }
};
