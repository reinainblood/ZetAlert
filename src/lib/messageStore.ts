import { IntegrationMessage } from './types';
import { getRedisClient } from './redis';

export class MessageStore {
    private static messagesKey = 'zetalert:messages';
    private static maxMessages = 100;

    static async addMessage(message: IntegrationMessage) {
        try {
            const redis = getRedisClient();
            await redis.lpush(this.messagesKey, JSON.stringify(message));
            await redis.ltrim(this.messagesKey, 0, this.maxMessages - 1);
        } catch (error) {
            console.error('Failed to store message:', error);
        }
    }

    static async getRecentMessages(): Promise<IntegrationMessage[]> {
        try {
            const redis = getRedisClient();
            const messages = await redis.lrange(this.messagesKey, 0, -1);
            return messages.map(msg => JSON.parse(msg));
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            return [];
        }
    }


    static async hasBeenSent(incidentId: string): Promise<{
        sent: boolean;
        platforms: ('discord' | 'slack')[];
        timestamp?: string;
        type: 'manual' | 'automatic';
    }> {
        try {
            const messages = await this.getRecentMessages();
            const sentMessages = messages.filter(
                msg => msg.trigger?.incidentId === incidentId
            );

            if (sentMessages.length === 0) {
                return { sent: false, platforms: [], type: 'manual' };
            }

            // Get unique platforms
            const platforms: ('discord' | 'slack')[] = Array.from(new Set(
                sentMessages.map(msg => msg.platform)
            )) as ('discord' | 'slack')[];

            return {
                sent: true,
                platforms,
                timestamp: sentMessages[0].timestamp,
                type: sentMessages[0].source
            };
        } catch (error) {
            console.error('Failed to check sent status:', error);
            return { sent: false, platforms: [], type: 'manual' };
        }
    }
}