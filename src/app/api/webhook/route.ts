// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { StatusWebhookPayload } from '@/lib/types';
import { sendToDiscord, sendToSlack } from '@/lib/messaging';

export async function POST(req: Request) {
    try {
        const payload: StatusWebhookPayload = await req.json();

        // Validate the payload
        if (!isValidStatusWebhookPayload(payload)) {
            return NextResponse.json(
                { error: 'Invalid payload format' },
                { status: 400 }
            );
        }

        // Format the message for chat platforms
        const message = formatStatusMessage(payload);

        // Send to configured webhooks
        await Promise.all([
            sendToDiscord(message, process.env.DISCORD_WEBHOOK_URL!),
            sendToSlack(message, process.env.SLACK_WEBHOOK_URL!)
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}

// Validation helper
function isValidStatusWebhookPayload(payload: any): payload is StatusWebhookPayload {
    return (
        payload &&
        payload.event === 'status_updated' &&
        typeof payload.component_id === 'string' &&
        typeof payload.component_name === 'string' &&
        ['operational', 'degraded', 'partial_outage', 'major_outage'].includes(payload.new_status) &&
        typeof payload.incident_id === 'string' &&
        typeof payload.timestamp === 'string' &&
        !isNaN(Date.parse(payload.timestamp))
    );
}

// Message formatting helper
function formatStatusMessage(payload: StatusWebhookPayload): string {
    const timestamp = new Date(payload.timestamp).toLocaleString();
    const statusEmoji = {
        operational: '✅',
        degraded: '⚠️',
        partial_outage: '🟡',
        major_outage: '🔴'
    }[payload.new_status];

    return [
        `${statusEmoji} **Status Update** - ${payload.component_name}`,
        ``,
        `New Status: ${payload.new_status.toUpperCase()}`,
        `Incident ID: ${payload.incident_id}`,
        `Component ID: ${payload.component_id}`,
        `Timestamp: ${timestamp}`,
        ``,
        `View full details: https://status.zetachain.com/incidents/${payload.incident_id}`
    ].join('\n');
}

export const GET = async () => {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
};