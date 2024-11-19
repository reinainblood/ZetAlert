import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import { sendToDiscord, sendToSlack } from '@/lib/messaging';
import type { NetworkAlertMessage } from '@/lib/types';


const redis = new Redis();


const REDIS_KEYS = {
    blockHeights: 'zetalert:block_heights'
} as const;

interface BlockData {
    height: string;
    timestamp: string;
    block_hash: string;
}

interface HealthCheck {
    isHealthy: boolean;
    alerts: NetworkAlertMessage[];
}

// Constants for health checks
const BLOCK_TIME_TARGET = 6; // seconds
const ACCEPTABLE_BLOCK_TIME_VARIANCE = 3; // seconds
const BLOCK_STALL_THRESHOLD = 30; // seconds
const MAX_STORED_BLOCKS = 100;

// Network configuration
const NETWORK = {
    name: 'Athens Testnet',
    blockExplorerUrl: 'https://explorer.zetachain.com/athens/block/',
};

async function fetchLatestBlock(): Promise<BlockData> {
    const response = await fetch('https://status.zetachain.com/api/v2/blocks/latest', {
        next: { revalidate: 0 }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch latest block: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        height: data.block.header.height,
        timestamp: data.block.header.time,
        block_hash: data.block.block_hash,
    };
}

async function checkAndStoreBlock(blockData: BlockData): Promise<HealthCheck> {
    if (!redis) {
        throw new Error('Redis not initialized');
    }

    const alerts: NetworkAlertMessage[] = [];
    const blocklink = `${NETWORK.blockExplorerUrl}${blockData.height}`;

    // Check timestamp staleness
    const now = new Date();
    const blockTime = new Date(blockData.timestamp);
    const timeDiff = (now.getTime() - blockTime.getTime()) / 1000;

    if (timeDiff > BLOCK_STALL_THRESHOLD) {
        alerts.push({
            type: 'network-alert',
            network: NETWORK.name,
            info: `Chain appears stalled. No new blocks for ${timeDiff.toFixed(1)} seconds. Latest block ${blockData.height} was produced at ${blockData.timestamp}`,
            blocklink
        });
    }

    try {
        // Store the new block height with its timestamp
        await redis.zadd(
            REDIS_KEYS.blockHeights,
            parseInt(blockData.height),
            JSON.stringify({
                timestamp: blockData.timestamp,
                hash: blockData.block_hash
            })
        );

        // Get previous blocks with scores
        const prevBlocks = await redis.zrange(REDIS_KEYS.blockHeights, -2, -1, 'WITHSCORES');

        // We need at least 4 items (two blocks with their scores) to compare
        if (prevBlocks.length >= 4) {
            // Parse the previous block data
            // Format: [oldBlockData, oldScore, newBlockData, newScore]
            const prevBlockData = JSON.parse(prevBlocks[0]);
            const prevBlockHeight = parseInt(prevBlocks[1]);
            const currentBlockData = JSON.parse(prevBlocks[2]);

            const prevBlockTime = new Date(prevBlockData.timestamp);
            const currentBlockTime = new Date(currentBlockData.timestamp);

            // Check block time progression
            const blockTimeDiff = (currentBlockTime.getTime() - prevBlockTime.getTime()) / 1000;

            if (blockTimeDiff > BLOCK_TIME_TARGET + ACCEPTABLE_BLOCK_TIME_VARIANCE) {
                alerts.push({
                    type: 'network-alert',
                    network: NETWORK.name,
                    info: `Block production is slower than expected. Time between blocks ${prevBlockHeight} and ${blockData.height}: ${blockTimeDiff.toFixed(1)}s (target: ${BLOCK_TIME_TARGET}s ±${ACCEPTABLE_BLOCK_TIME_VARIANCE}s)`,
                    blocklink
                });
            }

            // Check for missing blocks
            const heightDiff = parseInt(blockData.height) - prevBlockHeight;
            if (heightDiff > 1) {
                alerts.push({
                    type: 'network-alert',
                    network: NETWORK.name,
                    info: `Block sequence gap detected. Missing ${heightDiff - 1} blocks between heights ${prevBlockHeight} and ${blockData.height}. Current block timestamp: ${blockData.timestamp}`,
                    blocklink
                });
            }
        }

        // Cleanup old data
        const oldBlocks = await redis.zrange('block_heights', 0, -MAX_STORED_BLOCKS);
        if (oldBlocks.length > 0) {
            await redis.zrem('block_heights', ...oldBlocks);
        }

    } catch (error) {
        console.error('Error in checkAndStoreBlock:', error);
        alerts.push({
            type: 'network-alert',
            network: NETWORK.name,
            info: `Error monitoring block height: ${error instanceof Error ? error.message : 'Unknown error'}. Latest block: ${blockData.height}`,
            blocklink
        });
    }

    return {
        isHealthy: alerts.length === 0,
        alerts
    };
}

export async function GET(req: Request) {
    try {
        if (!redis) {
            throw new Error('Redis not initialized');
        }

        const latestBlock = await fetchLatestBlock();
        const healthCheck = await checkAndStoreBlock(latestBlock);

        if (!healthCheck.isHealthy && healthCheck.alerts.length > 0) {
            const message: NetworkAlertMessage = {
                type: 'network-alert',
                network: healthCheck.alerts[0].network,
                info: healthCheck.alerts.map(alert => alert.info).join('\n'),
                blocklink: healthCheck.alerts[0].blocklink
            };

            await Promise.all([
                sendToDiscord(message, process.env.DISCORD_WEBHOOK_URL!),
                sendToSlack(message, process.env.SLACK_WEBHOOK_URL!)
            ]);
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            latestBlock,
            healthCheck
        });
    } catch (error) {
        console.error('Block monitoring error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}