// src/__tests__/lib/messaging.test.ts
import { sendToDiscord, sendToSlack } from '@/lib/messaging';
import axios from 'axios';

jest.mock('axios');

describe('Messaging Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendToDiscord', () => {
        const webhookUrl = 'discord-webhook-url';

        test('sends plain text message correctly', async () => {
            const message = 'Test message';
            await sendToDiscord(message, webhookUrl);

            expect(axios.post).toHaveBeenCalledWith(webhookUrl, {
                content: message
            });
        });

        test('sends incident message with proper formatting', async () => {
            const incident = {
                type: 'incident' as const,
                name: 'Test Incident',
                status: 'investigating',
                impact: 'major',
                updated_at: '2024-01-01T00:00:00Z',
                shortlink: 'https://example.com'
            };

            await sendToDiscord(incident, webhookUrl);

            expect(axios.post).toHaveBeenCalled();
            const callArg = (axios.post as jest.Mock).mock.calls[0][1];
            expect(callArg.content).toContain('**Incident Update**');
            expect(callArg.content).toContain(incident.name);
        });
    });

    describe('sendToSlack', () => {
        const webhookUrl = 'slack-webhook-url';

        test('sends message with proper block formatting', async () => {
            const message = 'Test message';
            await sendToSlack(message, webhookUrl);

            expect(axios.post).toHaveBeenCalled();
            const callArg = (axios.post as jest.Mock).mock.calls[0][1];
            expect(callArg.blocks).toBeDefined();
            expect(callArg.blocks[0].type).toBe('section');
        });

        test('handles incident messages with proper formatting', async () => {
            const incident = {
                type: 'incident' as const,
                name: 'Test Incident',
                status: 'investigating',
                impact: 'major',
                updated_at: '2024-01-01T00:00:00Z',
                shortlink: 'https://example.com'
            };

            await sendToSlack(incident, webhookUrl);

            expect(axios.post).toHaveBeenCalled();
            const callArg = (axios.post as jest.Mock).mock.calls[0][1];
            expect(callArg.blocks).toBeDefined();
            expect(callArg.blocks[0].type).toBe('header');
        });
    });
});