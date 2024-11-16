// src/lib/api.ts
import axios from 'axios';
import { ZetaSummary } from './types';

const ZETA_API_BASE = 'https://status.zetachain.com/api/v2';

export async function fetchZetaStatus(): Promise<ZetaSummary> {
    try {
        const response = await axios.get(`${ZETA_API_BASE}/summary.json`);
        console.log('API Response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error fetching status:', error);
        // Return a safe default structure
        return {
            page: {
                id: '',
                name: '',
                url: '',
                time_zone: '',
                updated_at: new Date().toISOString()
            },
            status: {
                indicator: 'none',
                description: 'Status Unavailable'
            },
            components: [],
            incidents: [],
            scheduled_maintenances: []
        };
    }
}