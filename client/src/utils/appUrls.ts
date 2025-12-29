/**
 * Get the URL for a Sartthi ecosystem app based on the current environment
 * @param app - The app to get the URL for ('mail' | 'calendar' | 'vault')
 * @returns The full URL to the app
 */
export const getAppUrl = (app: 'mail' | 'calendar' | 'vault') => {
    // Check if we are in production based on hostname or environment
    const isProduction =
        process.env.NODE_ENV === 'production' ||
        (typeof window !== 'undefined' && window.location.hostname.includes('sartthi.com'));

    if (isProduction) {
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
            return 'http://localhost:3003';
    }
};
