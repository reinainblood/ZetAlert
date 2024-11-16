// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { sendToDiscord, sendToSlack } from '../../../lib/messaging';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        await Promise.all([
            sendToDiscord(data.message, process.env.DISCORD_WEBHOOK_URL!),
            sendToSlack(data.message, process.env.SLACK_WEBHOOK_URL!)
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