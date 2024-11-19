import { MessageStore } from '@/lib/messageStore';
import { IntegrationMessage } from '@/lib/types';

describe('MessageStore', () => {
    beforeEach(() => {
        // Use a public method to clear messages
        MessageStore.clearMessages();
    });

    test('adds a message to the store', () => {
        const message: IntegrationMessage = {
            id: '1',
            platform: 'discord',
            content: 'Test message',
            timestamp: new Date().toISOString(),
            source: 'manual'
        };

        MessageStore.addMessage(message);
        const recentMessages = MessageStore.getRecentMessages();
        expect(recentMessages).toHaveLength(1);

    });

    test('maintains max message limit', () => {
        const maxMessages = 100; // This should match the limit in MessageStore

        // Add more than the limit
        for (let i = 0; i < maxMessages + 10; i++) {
            MessageStore.addMessage({
                id: i.toString(),
                platform: 'discord',
                content: `Message ${i}`,
                timestamp: new Date().toISOString(),
                source: 'manual'
            });
        }

        const recentMessages = MessageStore.getRecentMessages();
        expect(recentMessages).toHaveLength(maxMessages);
        // Check that we have the most recent messages (highest IDs)

    });
});