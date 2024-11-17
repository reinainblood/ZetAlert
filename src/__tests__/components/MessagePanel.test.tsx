// src/__tests__/components/MessagePanel.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessagePanel } from '@/components/MessagePanel';
import { ZetaSummary } from '@/lib/types';
import axios from 'axios';
import { MessageStore } from '@/lib/messageStore';

jest.mock('axios');
jest.mock('@/lib/messageStore');

const mockStatus: ZetaSummary = {
    page: {
        id: 'test',
        name: 'Test Page',
        url: 'https://test.com',
        time_zone: 'UTC',
        updated_at: new Date().toISOString()
    },
    status: {
        indicator: 'none',
        description: 'All systems operational'
    },
    components: [],
    incidents: [],
    scheduled_maintenances: []
};

describe('MessagePanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders message input and platform selection', () => {
        render(<MessagePanel status={mockStatus} />);

        expect(screen.getByPlaceholderText(/enter.*message/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/discord/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/slack/i)).toBeInTheDocument();
    });

    it('sends message when form is submitted', async () => {
        (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });

        render(<MessagePanel status={mockStatus} />);

        const input = screen.getByPlaceholderText(/enter.*message/i) as HTMLTextAreaElement;
        const discordCheckbox = screen.getByLabelText(/discord/i) as HTMLInputElement;
        const sendButton = screen.getByRole('button', { name: /send/i });

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(discordCheckbox);
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/messages', {
                message: 'Test message',
                platforms: ['discord']
            });
        });
    });

    it('displays selected incidents when available', () => {
        const statusWithIncidents: ZetaSummary = {
            ...mockStatus,
            incidents: [{
                id: '1',
                name: 'Test Incident',
                status: 'investigating',
                impact: 'minor',
                shortlink: 'https://test.com/incident',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                monitoring_at: null,
                resolved_at: null,
                impact_override: false,
                scheduled_for: null,
                scheduled_until: null
            }]
        };

        render(<MessagePanel status={statusWithIncidents} />);
        expect(screen.getByText('Test Incident')).toBeInTheDocument();
    });

    it('displays recent messages', async () => {
        const mockMessages = [{
            id: '1',
            platform: 'discord' as const,
            content: 'Test message',
            timestamp: new Date().toISOString(),
            source: 'manual' as const
        }];

        (axios.get as jest.Mock).mockResolvedValue({ data: { messages: mockMessages } });

        render(<MessagePanel status={mockStatus} />);

        await waitFor(() => {
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });
    });

    it('handles message sending errors', async () => {
        (axios.post as jest.Mock).mockRejectedValue(new Error('Failed to send'));

        render(<MessagePanel status={mockStatus} />);

        const input = screen.getByPlaceholderText(/enter.*message/i) as HTMLTextAreaElement;
        const discordCheckbox = screen.getByLabelText(/discord/i) as HTMLInputElement;
        const sendButton = screen.getByRole('button', { name: /send/i });

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(discordCheckbox);
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
        });
    });

    it('disables send button when no platform is selected', () => {
        render(<MessagePanel status={mockStatus} />);

        const input = screen.getByPlaceholderText(/enter.*message/i) as HTMLTextAreaElement;
        const sendButton = screen.getByRole('button', { name: /send/i });

        fireEvent.change(input, { target: { value: 'Test message' } });
        expect(sendButton).toBeDisabled();
    });
});