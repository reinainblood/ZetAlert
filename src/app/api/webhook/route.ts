// src/app/api/webhooks/route.ts
// This handles our outgoing messages to Discord/Slack from the dashboard
import { NextResponse } from 'next/server';
import { sendToDiscord, sendToSlack } from '@/lib/messaging';

export async function POST(req: Request) {
    try {
        const { message, platforms } = await req.json();

        if (!message || !platforms || !Array.isArray(platforms)) {
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            );
        }

        const promises = [];
        if (platforms.includes('discord')) {
            promises.push(sendToDiscord(message, process.env.DISCORD_WEBHOOK_URL!));
        }
        if (platforms.includes('slack')) {
            promises.push(sendToSlack(message, process.env.SLACK_WEBHOOK_URL!));
        }

        await Promise.all(promises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}