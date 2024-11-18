// src/app/api/ext-webhook/route.ts
import { NextResponse } from 'next/server';
import { handleIncomingStatusUpdate } from '@/lib/api';
import { StatusUpdatePayload } from '@/lib/types';

export async function POST(req: Request) {
    try {
        const payload = await req.json() as StatusUpdatePayload;

        // Validate the payload
        if (!isValidStatusPayload(payload)) {
            return NextResponse.json(
                { error: 'Invalid payload format' },
                { status: 400 }
            );
        }

        await handleIncomingStatusUpdate(
            payload,
            process.env.DISCORD_WEBHOOK_URL!,
            process.env.SLACK_WEBHOOK_URL!
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}

// Payload validation helper
function isValidStatusPayload(payload: any): payload is StatusUpdatePayload {
    return (
        payload &&
        payload.event === 'string' &&
        typeof payload.component_id === 'string' &&
        typeof payload.component_name === 'string' &&
        typeof payload.new_status === 'string' &&
        typeof payload.incident_id === 'string' &&
        typeof payload.timestamp === 'string' &&
        !isNaN(Date.parse(payload.timestamp))
    );
}