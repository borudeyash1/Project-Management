import axios from 'axios';
import { ConnectedAccount } from '../../models/ConnectedAccount';

const ZOOM_API_URL = 'https://api.zoom.us/v2';

export const getZoomService = () => {

    const getAccessToken = async (userId: string, accountId?: string) => {
        let query: any = { userId, service: 'zoom' };
        if (accountId) query._id = accountId;
        else query.isActive = true;

        const account = await ConnectedAccount.findOne(query);
        if (!account || !account.accessToken) throw new Error('Zoom account not connected');
        return account.accessToken;
    };

    const createMeeting = async (userId: string, topic: string, startTime: string, duration: number, accountId?: string) => {
        try {
            const token = await getAccessToken(userId, accountId);
            const response = await axios.post(`${ZOOM_API_URL}/users/me/meetings`,
                {
                    topic,
                    type: 2, // Scheduled meeting
                    start_time: startTime,
                    duration,
                    settings: {
                        host_video: true,
                        participant_video: true,
                        join_before_host: false,
                        mute_upon_entry: true,
                        waiting_room: true
                    }
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return {
                id: response.data.id,
                joinUrl: response.data.join_url,
                startUrl: response.data.start_url,
                password: response.data.password
            };
        } catch (error: any) {
            console.error('Zoom createMeeting error:', error.response?.data || error.message);
            throw error;
        }
    };

    return { createMeeting };
};
