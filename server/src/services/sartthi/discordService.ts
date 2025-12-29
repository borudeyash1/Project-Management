import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

class DiscordService {
    private client: Client;
    private isReady: boolean = false;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
                // GatewayIntentBits.GuildPresences // Temporarily removed to debug intents error
            ]
        });

        this.client.once('ready', () => {
            console.log(`✅ [Discord] Logged in as ${this.client.user?.tag}!`);
            this.isReady = true;
        });

        this.client.on('error', (error) => {
            console.error('❌ [Discord] Client Error:', error);
        });

        console.log('[Discord] Service initialized, attempting connection...');
        this.connect();
    }

    private async connect() {
        try {
            const token = process.env.DISCORD_BOT_TOKEN;
            if (!token) {
                console.error('❌ [Discord] DISCORD_BOT_TOKEN is missing from .env');
                return;
            }
            console.log(`[Discord] Attempting login with token (length: ${token.length})...`);
            await this.client.login(token.trim());
        } catch (error: any) {
            console.error('❌ [Discord] Failed to login:', error.message);
            // Retry logic could go here
        }
    }

    public isConnected(): boolean {
        // Double check status
        if (!this.isReady && this.client.isReady()) {
            this.isReady = true;
        }
        return this.isReady;
    }

    private async waitForReady(timeout = 5000): Promise<boolean> {
        if (this.isConnected()) return true;

        console.log('[Discord] Waiting for client to be ready...');
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (this.isConnected()) return true;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.warn('[Discord] Timeout waiting for client ready');
        return false;
    }

    public async getGuilds() {
        await this.waitForReady();
        if (!this.isReady) return [];

        try {
            const guilds = await this.client.guilds.fetch();
            return Promise.all(guilds.map(async (oauthGuild) => {
                const guild = await oauthGuild.fetch();
                return {
                    _id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL(),
                    memberCount: guild.memberCount,
                    description: guild.description,
                    channels: [] // Will be populated on demand
                };
            }));
        } catch (error) {
            console.error('[Discord] Failed to fetch guilds:', error);
            return [];
        }
    }

    public async getChannels(guildId: string) {
        if (!this.isReady) return [];
        try {
            const guild = await this.client.guilds.fetch(guildId);
            const channels = await guild.channels.fetch();

            return channels
                .filter(channel => channel && (channel.isTextBased() || channel.isVoiceBased()))
                .map(channel => {
                    if (!channel) return null;
                    return {
                        _id: channel.id,
                        name: channel.name,
                        type: channel.isVoiceBased() ? 'voice' : 'text',
                        topic: 'topic' in channel ? channel.topic : ''
                    };
                })
                .filter(Boolean);
        } catch (error) {
            console.error(`Failed to fetch channels for guild ${guildId}:`, error);
            return [];
        }
    }

    public async getMessages(channelId: string, limit: number = 50) {
        if (!this.isReady) return [];
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) return [];

            const messages = await (channel as TextChannel).messages.fetch({ limit });

            return messages.map(msg => ({
                _id: msg.id,
                content: msg.content,
                authorId: {
                    _id: msg.author.id,
                    username: msg.author.username,
                    profilePicture: msg.author.displayAvatarURL()
                },
                createdAt: msg.createdAt,
                attachments: msg.attachments.map(att => att.url),
                channelId: msg.channelId
            })).reverse(); // Oldest first for chat UI
        } catch (error) {
            console.error(`Failed to fetch messages for channel ${channelId}:`, error);
            return [];
        }
    }

    public async sendMessage(channelId: string, content: string) {
        if (!this.isReady) throw new Error('Discord client not ready');
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) throw new Error('Channel not found or not text-based');

            const msg = await (channel as TextChannel).send(content);

            return {
                _id: msg.id,
                content: msg.content,
                authorId: {
                    _id: msg.author.id,
                    username: msg.author.username,
                    profilePicture: msg.author.displayAvatarURL()
                },
                createdAt: msg.createdAt,
                attachments: msg.attachments.map(att => att.url),
                channelId: msg.channelId
            };
        } catch (error) {
            console.error(`Failed to send message to channel ${channelId}:`, error);
            throw error;
        }
    }
    public async deleteMessage(channelId: string, messageId: string) {
        if (!this.isReady) throw new Error('Discord client not ready');
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) throw new Error('Channel not found');
            const msg = await (channel as TextChannel).messages.fetch(messageId);
            await msg.delete();
            return true;
        } catch (error) {
            console.error(`Failed to delete message ${messageId}:`, error);
            throw error;
        }
    }

    public async getMembers(guildId: string) {
        if (!this.isReady) return [];
        try {
            const guild = await this.client.guilds.fetch(guildId);
            const members = await guild.members.fetch();
            return members.map(m => ({
                userId: m.id,
                username: m.user.username,
                displayName: m.displayName,
                profilePicture: m.user.displayAvatarURL(),
                roles: m.roles.cache.map(r => ({ name: r.name, color: r.hexColor })),
                status: m.presence?.status || 'offline',
                voiceChannelId: m.voice.channelId
            }));
        } catch (error) {
            console.error(`Failed to fetch members for guild ${guildId}:`, error);
            return [];
        }
    }

    public async kickMember(guildId: string, userId: string, reason?: string) {
        if (!this.isReady) throw new Error('Discord client not ready');
        try {
            const guild = await this.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            if (member.kickable) {
                await member.kick(reason);
                return true;
            } else {
                throw new Error('Bot does not have permission to kick this member');
            }
        } catch (error) {
            console.error(`Failed to kick member ${userId}:`, error);
            throw error;
        }
    }

    public async banMember(guildId: string, userId: string, reason?: string) {
        if (!this.isReady) throw new Error('Discord client not ready');
        try {
            const guild = await this.client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            if (member.bannable) {
                await member.ban({ reason });
                return true;
            } else {
                throw new Error('Bot does not have permission to ban this member');
            }
        } catch (error) {
            console.error(`Failed to ban member ${userId}:`, error);
            throw error;
        }
    }
}

// Singleton instance
const discordService = new DiscordService();
export default discordService;
