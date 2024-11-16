// src/app/api/ext-webhook/route.ts
// This handles incoming status updates from the Zetachain status page
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
        const message = formatStatusUpdateMessage(payload);

        // Send to configured webhooks
        await Promise.all([
            sendToDiscord(message, process.env.DISCORD_WEBHOOK_URL!),
            sendToSlack(message, process.env.SLACK_WEBHOOK_URL!)
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Status webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process status update' },
            { status: 500 }
        );
    }
}

function isValidStatusWebhookPayload(payload: any): payload is StatusWebhookPayload {
    return (
        payload &&
        payload.event === 'status_updated' &&
        typeof payload.component_id === 'string' &&
        typeof payload.component_name === 'string' &&
        ['operational', 'degraded', 'partial_outage', 'major_outage'].includes(payload.new_status) &&
        typeof payload.incident_id === 'string' &&
        typeof payload.timestamp === 'string'
    );
}

function formatStatusUpdateMessage(payload: StatusWebhookPayload): string {
    const timestamp = new Date(payload.timestamp).toLocaleString();
    const statusEmoji = {
        operational: '✅',
        degraded: '⚠️',
        partial_outage: '🟡',
        major_outage: '🔴'
    }[payload.new_status];

    return [
        `${statusEmoji} **ZetaChain Status Update** - ${payload.component_name}`,
        ``,
        `New Status: ${payload.new_status.toUpperCase()}`,
        `Incident ID: ${payload.incident_id}`,
        `Time: ${timestamp}`,
        ``,
        `View details: https://status.zetachain.com/incidents/${payload.incident_id}`
    ].join('\n');
}