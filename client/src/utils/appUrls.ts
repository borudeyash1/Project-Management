/**
 * Get the URL for a Sartthi ecosystem app based on the current environment
 * @param app - The app to get the URL for ('mail' | 'calendar' | 'vault')
 * @returns The full URL to the app
 */
export const getAppUrl = (app: 'mail' | 'calendar' | 'vault'): string => {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        // Development: Use localhost with different ports
        const ports: Record<'mail' | 'calendar' | 'vault', number> = {
            mail: 3001,
            calendar: 3002,
            vault: 3003,
        };
        return `http://localhost:${ports[app]}`;
    }

    // Production: Use subdomains
    return `https://${app}.sartthi.com`;
};
