// src/lib/auth.ts
import { getServerSession } from 'next-auth';

export async function requireAuth() {
    const session = await getServerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}
