// src/app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sendToDiscord, sendToSlack } from '@/lib/messaging';
import { MessageStore } from '@/lib/messageStore';

export async function GET() {
    try {
        await requireAuth();
        const messages = MessageStore.getRecentMessages();
        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await requireAuth();
        const { message, platforms } = await req.json();

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
        console.error('Message sending error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}