// src/lib/redis.ts
import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient() {
    if (!redis) {
        if (!process.env.KV_REDIS_URL) {
            throw new Error('KV_REDIS_URL is not defined');
        }

        redis = new Redis(process.env.KV_REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        redis.on('error', (error) => {
            console.error('Redis connection error:', error);
        });
    }

    return redis;
}