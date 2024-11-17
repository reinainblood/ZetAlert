// src/__tests__/lib/messageStore.test.ts
import { MessageStore } from '@/lib/messageStore';
import { IntegrationMessage } from '@/lib/types';

describe('MessageStore', () => {
    beforeEach(() => {
        // Clear the message store before each test
        MessageStore['messages'] = [];
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
        expect(MessageStore.getRecentMessages()).toHaveLength(1);
        expect(MessageStore.getRecentMessages()[0]).toEqual(message);
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

        expect(MessageStore.getRecentMessages()).toHaveLength(maxMessages);
        // Check that we have the most recent messages (highest IDs)
        expect(MessageStore.getRecentMessages()[0].id).toBe('109');
    });
});