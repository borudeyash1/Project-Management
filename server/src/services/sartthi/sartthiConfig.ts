import { initializeCalendarService } from './calendarService';
import { initializeMailService } from './mailService';

export const initializeSartthiServices = () => {
    const apiKey = process.env.SARTTHI_API_KEY;
    const baseUrl = process.env.SARTTHI_API_URL || 'https://api.sartthi.com/v1';
    const mailFrom = process.env.SARTTHI_MAIL_FROM || 'noreply@sartthi.com';

    if (!apiKey) {
        console.warn('[Sartthi Services] API key not found. Services will not be initialized.');
        return;
    }

    console.log('[Sartthi Services] Initializing services...');

    initializeCalendarService({
        baseUrl,
        apiKey,
        userId: 'system' // Default system user
    });

    initializeMailService({
        baseUrl,
        apiKey,
        fromAddress: mailFrom
    });

    console.log('[Sartthi Services] Services initialized successfully.');
};
