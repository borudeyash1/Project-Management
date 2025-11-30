import { Request, Response } from 'express';
import { getCalendarService } from '../services/sartthi/calendarService';
import { getMailService } from '../services/sartthi/mailService';
import { AuthenticatedRequest } from '../types';

// Calendar Controller
export const getCalendarEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const calendarService = getCalendarService();
        if (!calendarService) {
            // Return mock data if service not configured
            return res.status(200).json({
                events: [
                    {
                        id: 'mock-1',
                        title: 'Team Standup (Mock)',
                        startTime: new Date().toISOString(),
                        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
                        day: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
                        color: 'blue'
                    }
                ]
            });
        }

        const { start, end } = req.query;
        const startDate = start ? new Date(start as string) : new Date();
        const endDate = end ? new Date(end as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const events = await calendarService.getEvents(startDate, endDate);
        return res.status(200).json({ events });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
};

// Mail Controller
export const getEmails = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const mailService = getMailService();
        if (!mailService) {
            // Return mock data if service not configured
            return res.status(200).json({
                emails: [
                    {
                        id: 'mock-1',
                        sender: 'System',
                        subject: 'Welcome to Sartthi Mail (Mock)',
                        preview: 'This is a placeholder email because the API is not connected.',
                        time: 'Just now',
                        isUnread: true,
                        isStarred: false
                    }
                ]
            });
        }

        const { folder = 'inbox', limit = 20 } = req.query;
        const emails = await mailService.getEmails(folder as string, Number(limit));
        return res.status(200).json({ emails });
    } catch (error) {
        console.error('Error fetching emails:', error);
        return res.status(500).json({ message: 'Failed to fetch emails' });
    }
};

export const sendEmail = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const mailService = getMailService();
        if (!mailService) {
            return res.status(503).json({ message: 'Mail service not available' });
        }

        const { to, subject, body } = req.body;
        const success = await mailService.sendEmail({ to, subject, body });

        if (success) {
            return res.status(200).json({ message: 'Email sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send email' });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
    }
};
