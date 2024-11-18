
// src/__tests__/lib/api.test.ts
import { determineImpact, handleIncomingStatusUpdate } from '@/lib/api';
import { sendToDiscord, sendToSlack } from '@/lib/messaging';
import { MessageStore } from '@/lib/messageStore';

// Mock the external dependencies
jest.mock('@/lib/messaging');
jest.mock('@/lib/messageStore');

describe('API Functions', () => {
    describe('determineImpact', () => {
        test.each([
            ['major_outage', 'critical'],
            ['partial_outage', 'major'],
            ['degraded_performance', 'minor'],
            ['operational', 'none'],
            ['unknown_status', 'none'],
        ])('determines correct impact level for %s status', (status, expectedImpact) => {
            expect(determineImpact(status)).toBe(expectedImpact);
        });
    });

    describe('handleIncomingStatusUpdate', () => {
        const mockPayload = {
            event: 'status_updated',
            component_id: '123',
            component_name: 'Test Component',
            new_status: 'degraded_performance',
            incident_id: 'INC-123',
            timestamp: '2024-01-01T00:00:00Z'
        };

        const mockWebhooks = {
            discord: 'discord-webhook-url',
            slack: 'slack-webhook-url'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('processes status update and sends to all platforms', async () => {
            await handleIncomingStatusUpdate(mockPayload, mockWebhooks.discord, mockWebhooks.slack);

            expect(sendToDiscord).toHaveBeenCalled();
            expect(sendToSlack).toHaveBeenCalled();
            expect(MessageStore.addMessage).toHaveBeenCalledTimes(2); // Once for each platform
        });

        test('handles errors appropriately', async () => {
            (sendToDiscord as jest.Mock).mockRejectedValue(new Error('Discord error'));

            await expect(
                handleIncomingStatusUpdate(mockPayload, mockWebhooks.discord, mockWebhooks.slack)
            ).rejects.toThrow();
        });
    });
});



