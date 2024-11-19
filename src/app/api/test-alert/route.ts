// src/app/api/test-alert/route.ts
import { NextResponse } from 'next/server';
import { MessageStore } from '@/lib/messageStore';

export async function GET() {
    try {
        const testMessage = {
            id: `test-${Date.now()}`,
            platform: 'discord' as const,
            timestamp: new Date().toISOString(),
            content: 'Test alert content',
            source: 'automatic' as const,
            network: 'Athens Testnet',
            info: 'Block production is slower than expected. Time between blocks 12345 and 12346: 9.5s (target: 6s ±3s)',
            blockLink: 'https://explorer.zetachain.com/athens/block/12346'
        };

        await MessageStore.addMessage(testMessage);

        return NextResponse.json({
            success: true,
            message: 'Test alert created'
        });
    } catch (error) {
        console.error('Failed to create test alert:', error);
        return NextResponse.json(
            { error: 'Failed to create test alert' },
            { status: 500 }
        );
    }
}