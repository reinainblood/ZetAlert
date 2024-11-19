// src/lib/api.ts
import axios from 'axios';
import { ZetaSummary, IntegrationMessage, TriggerType } from './types';
import { sendToDiscord, sendToSlack } from './messaging';
import { MessageStore } from './messageStore';
import { StatusUpdatePayload } from './types'
import {NextApiRequest, NextApiResponse} from "next";

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



export function determineImpact(status: string): 'critical' | 'major' | 'minor' | 'none' {
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

export async function handleIncomingStatusUpdate(
    payload: StatusUpdatePayload,
    discordWebhook: string,
    slackWebhook: string
) {
    try {
        // Create a single message object to use for both sending and storing
        const formattedMessage = [
            `🔔 **Status Update**: ${payload.component_name}`,
            `New Status: ${payload.new_status.toUpperCase()}`,
            `Incident ID: ${payload.incident_id}`,
            `Time: ${new Date(payload.timestamp).toLocaleString()}`
        ].join('\n');

        // Send to both platforms
        await Promise.all([
            sendToDiscord(formattedMessage, discordWebhook),
            sendToSlack(formattedMessage, slackWebhook)
        ]);

        // Store messages for both platforms
        const baseMessage: Omit<IntegrationMessage, 'id' | 'platform'> = {
            content: formattedMessage,
            timestamp: new Date().toISOString(),
            source: 'automatic',
            trigger: {
                type: 'status_update',
                componentId: payload.component_id,
                componentName: payload.component_name,
                incidentId: payload.incident_id
            }
        };

        // Store for Discord
        MessageStore.addMessage({
            ...baseMessage,
            id: `${Date.now()}-discord-${payload.incident_id}`,
            platform: 'discord'
        });

        // Store for Slack
        MessageStore.addMessage({
            ...baseMessage,
            id: `${Date.now()}-slack-${payload.incident_id}`,
            platform: 'slack'
        });

        return true;
    } catch (error) {
        console.error('Error handling status update:', error);
        throw error;
    }
}

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