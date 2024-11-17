// src/lib/api.ts
import axios from 'axios';
import { ZetaSummary } from './types';
import { sendToDiscord, sendToSlack } from './messaging';
import { MessageStore } from './messageStore';

const ZETA_API_BASE = 'https://status.zetachain.com/api/v2';

export async function fetchZetaStatus(): Promise<ZetaSummary> {
    try {
        const { data } = await axios.get<ZetaSummary>(`${ZETA_API_BASE}/summary.json`);
        return data;
    } catch (error) {
        console.error('Error fetching status:', error);
        // Return a safe default if the API fails
        return {
            page: {
                id: '',
                name: '',
                url: '',
                time_zone: '',
                updated_at: new Date().toISOString()
            },
            status: {
                indicator: 'none',
                description: 'Status Unavailable'
            },
            components: [],
            incidents: [],
            scheduled_maintenances: []
        };
    }
}

// New type for incoming webhook payload
export interface StatusUpdatePayload {
    event: 'status_updated';
    component_id: string;
    component_name: string;
    new_status: string;
    incident_id: string;
    timestamp: string;
}


export async function handleIncomingStatusUpdate(
    payload: StatusUpdatePayload,
    discordWebhook: string,
    slackWebhook: string
) {
    try {
        const formattedMessage = {
            type: 'incident' as const,
            name: `${payload.component_name} Status Update`,
            status: payload.new_status,
            impact: determineImpact(payload.new_status),
            updated_at: payload.timestamp,
            shortlink: `https://status.zetachain.com/incidents/${payload.incident_id}`
        };

        // Send to both platforms
        await Promise.all([
            sendToDiscord(formattedMessage, discordWebhook),
            sendToSlack(formattedMessage, slackWebhook)
        ]);

        // Store messages for both platforms
        const baseMessage = {
            id: `${Date.now()}-${payload.component_id}`,
            timestamp: new Date().toISOString(),
            source: 'automatic' as const,
            trigger: {
                type: 'status_update',
                componentName: payload.component_name,
                componentId: payload.component_id
            },
            content: [
                `🤖 Automatic Status Update: ${payload.component_name}`,
                `New Status: ${payload.new_status.toUpperCase()}`,
                `Incident: ${payload.incident_id}`,
                `Time: ${new Date(payload.timestamp).toLocaleString()}`
            ].join('\n')
        };

        // Store for Discord
        MessageStore.addMessage({
            ...baseMessage,
            platform: 'discord',
            id: `${baseMessage.id}-discord`

        });

        // Store for Slack
        MessageStore.addMessage({
            ...baseMessage,
            platform: 'slack',
            id: `${baseMessage.id}-slack`
        });

        return true;
    } catch (error) {
        console.error('Error handling status update:', error);
        throw error;
    }
}



// Helper function to determine impact level based on status
function determineImpact(status: string): 'critical' | 'major' | 'minor' | 'none' {
    switch (status.toLowerCase()) {
        case 'major_outage':
            return 'critical';
        case 'partial_outage':
            return 'major';
        case 'degraded_performance':
            return 'minor';
        default:
            return 'none';
    }
}

// Optional: Add helper functions
export function hasStatusIssue(status: string): boolean {
    return status !== 'operational' && status !== 'none';
}

export function pollZetaStatus(
    callback: (status: ZetaSummary) => void,
    interval: number = 60000
) {
    const poll = async () => {
        try {
            const status = await fetchZetaStatus();
            callback(status);
        } catch (error) {
            console.error('Error polling status:', error);
        }
        setTimeout(poll, interval);
    };

    poll();
}