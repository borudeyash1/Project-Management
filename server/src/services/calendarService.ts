import { google } from 'googleapis';
import User from '../models/User';

export async function getCalendarClient(userId: string) {
    const user = await User.findById(userId);

    // [MODIFIED] Check connectedAccounts first, fallback to modules
    let refreshToken = user?.modules?.calendar?.refreshToken;

    if (!refreshToken) {
        // Check connectedAccounts
        const activeAccountId = user?.connectedAccounts?.calendar?.activeAccountId;
        if (activeAccountId) {
            const account = await import('../models/ConnectedAccount').then(m => m.ConnectedAccount.findById(activeAccountId));
            if (account) refreshToken = account.refreshToken;
        }
    }

    if (!refreshToken) {
        throw new Error('Calendar not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sartthi-accounts'}/calendar/callback`
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function listEvents(userId: string, timeMin?: string, timeMax?: string) {
    try {
        console.log('📅 [CALENDAR] Fetching events for user:', userId);

        const calendar = await getCalendarClient(userId);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin || new Date().toISOString(),
            timeMax: timeMax,
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        console.log('📅 [CALENDAR] Found', response.data.items?.length || 0, 'events');

        return response.data.items || [];
    } catch (error: any) {
        console.error('📅 [CALENDAR] Error:', error.message);
        throw error;
    }
}

export async function createEvent(userId: string, eventData: any) {
    try {
        const calendar = await getCalendarClient(userId);

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: eventData
        });

        console.log('📅 [CALENDAR] Event created:', response.data.id);
        return response.data;
    } catch (error: any) {
        console.error('📅 [CALENDAR] Create error:', error.message);
        throw error;
    }
}

export async function updateEvent(userId: string, eventId: string, eventData: any) {
    try {
        const calendar = await getCalendarClient(userId);

        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            requestBody: eventData
        });

        console.log('📅 [CALENDAR] Event updated:', eventId);
        return response.data;
    } catch (error: any) {
        console.error('📅 [CALENDAR] Update error:', error.message);
        throw error;
    }
}

export async function deleteEvent(userId: string, eventId: string) {
    try {
        const calendar = await getCalendarClient(userId);

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId
        });

        console.log('📅 [CALENDAR] Event deleted:', eventId);
    } catch (error: any) {
        console.error('📅 [CALENDAR] Delete error:', error.message);
        throw error;
    }
}
