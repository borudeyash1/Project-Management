import { Request, Response } from 'express';
import { ConnectedAccount } from '../models/ConnectedAccount';
import User from '../models/User';

type ServiceType = 'mail' | 'calendar' | 'vault';

/**
 * Migration endpoint to sync existing connected accounts with the legacy modules field
 * This is needed for accounts that were connected before the sync logic was added
 */
export const syncExistingAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        console.log('[Sync] Starting sync for user:', userId);

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const services: ServiceType[] = ['mail', 'calendar', 'vault'];
        let syncedCount = 0;

        for (const service of services) {
            const activeAccountId = user.connectedAccounts?.[service]?.activeAccountId;

            if (activeAccountId) {
                console.log(`[Sync] Found active ${service} account:`, activeAccountId);

                const account = await ConnectedAccount.findById(activeAccountId);

                if (account) {
                    // Initialize modules if needed
                    if (!user.modules) user.modules = {};

                    if (!user.modules[service]) {
                        user.modules[service] = {
                            isEnabled: false,
                            refreshToken: undefined,
                            connectedAt: undefined,
                            lastSyncedAt: undefined
                        };
                    }

                    // Sync the data
                    user.modules[service]!.isEnabled = true;
                    user.modules[service]!.refreshToken = account.refreshToken;
                    user.modules[service]!.connectedAt = account.createdAt;

                    syncedCount++;
                    console.log(`[Sync] Synced ${service} module`);
                }
            }
        }

        await user.save();

        res.json({
            success: true,
            message: `Successfully synced ${syncedCount} service(s)`,
            data: {
                syncedServices: syncedCount,
                modules: user.modules
            }
        });
    } catch (error: any) {
        console.error('[Sync] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
