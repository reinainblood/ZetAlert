// src/lib/messaging.ts
import axios, {AxiosResponse} from 'axios';
import { ZetaSummary, IncidentMessage, MaintenanceMessage, StatusMessage } from './types';

// Type guard functions
function isIncidentMessage(message: StatusMessage): message is IncidentMessage {
    return typeof message !== 'string' && 'type' in message && message.type === 'incident';
}

function isMaintenanceMessage(message: StatusMessage): message is MaintenanceMessage {
    return typeof message !== 'string' && 'type' in message && message.type === 'maintenance';
}

// Helper to convert from API types to our message types
export function convertIncident(incident: ZetaSummary['incidents'][0]): IncidentMessage {
    return {
        type: 'incident',
        name: incident.name,
        status: incident.status,
        impact: incident.impact,
        updated_at: incident.updated_at,
        shortlink: incident.shortlink
    };
}

export function convertMaintenance(maintenance: ZetaSummary['scheduled_maintenances'][0]): MaintenanceMessage {
    return {
        type: 'maintenance',
        name: maintenance.name,
        status: maintenance.status,
        scheduled_for: maintenance.scheduled_for,
        scheduled_until: maintenance.scheduled_until,
        shortlink: maintenance.shortlink
    };
}

export async function sendToDiscord(message: StatusMessage, webhookUrl: string) {
    let content: string;

    if (typeof message === 'string') {
        content = message;
    } else if (isIncidentMessage(message)) {
        content = [
            '🔔 **Incident Update**',
            `**Incident:** ${message.name}`,
            `**Status:** ${message.status.toUpperCase()}`,
            `**Impact:** ${message.impact.toUpperCase()}`,
            `**Updated:** ${new Date(message.updated_at).toLocaleString()}`,
            `**Details:** ${message.shortlink}`
        ].join('\n');
    } else if (isMaintenanceMessage(message)) {
        content = [
            '🗓️ **Scheduled Maintenance Update**',
            `**Event:** ${message.name}`,
            `**Status:** ${message.status.toUpperCase()}`,
            `**Scheduled For:** ${new Date(message.scheduled_for).toLocaleString()}`,
            `**Until:** ${new Date(message.scheduled_until).toLocaleString()}`,
            `**Details:** ${message.shortlink}`
        ].join('\n');
    } else {
        throw new Error('Invalid message type');
    }

    return axios.post(webhookUrl, { content });
}
// src/lib/messaging.ts

interface SlackBlock {
    type: string;
    text?: {
        type: string;
        text: string;
    };
    fields?: {
        type: string;
        text: string;
    }[];
    accessory?: {
        type: string;
        text: {
            type: string;
            text: string;
        };
        url: string;
        action_id?: string;
    };
}

export async function sendToSlack(message: StatusMessage, webhookUrl: string) {
    let blocks: SlackBlock[] = [];

    if (typeof message === 'string') {
        blocks = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: message
                }
            }
        ];
    }
    else if (isIncidentMessage(message)) {
        const severityColor =
            message.impact === 'critical' ? '🔴' :
                message.impact === 'major' ? '🟠' :
                    message.impact === 'minor' ? '🟡' : '⚪';

        blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `${severityColor} ZetaChain Incident Update`
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Incident:*\n${message.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Status:*\n${message.status.toUpperCase()}`
                    }
                ]
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Impact:*\n${message.impact.toUpperCase()}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Updated:*\n<!date^${Math.floor(new Date(message.updated_at).getTime() / 1000)}^{date_short_pretty} at {time}|${message.updated_at}>`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "For more details:"
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "View Incident 🔍"
                    },
                    url: message.shortlink,
                    action_id: "view_incident"
                }
            },
            {
                type: "divider"
            }
        ];
    }
    else if (isMaintenanceMessage(message)) {
        blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🗓️ ZetaChain Scheduled Maintenance"
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Event:*\n${message.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Status:*\n${message.status.toUpperCase()}`
                    }
                ]
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Scheduled For:*\n<!date^${Math.floor(new Date(message.scheduled_for).getTime() / 1000)}^{date_short_pretty} at {time}|${message.scheduled_for}>`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Until:*\n<!date^${Math.floor(new Date(message.scheduled_until).getTime() / 1000)}^{date_short_pretty} at {time}|${message.scheduled_until}>`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "For more details:"
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "View Maintenance 🗓️"
                    },
                    url: message.shortlink,
                    action_id: "view_maintenance"
                }
            },
            {
                type: "divider"
            }
        ];
    }

    return axios.post(webhookUrl, { blocks });
}
