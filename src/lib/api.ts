// src/lib/api.ts
import axios from 'axios';
import { ZetaStatus } from './types';

const ZETA_API_BASE = 'https://status.zetachain.com/api/v2';

export async function fetchZetaStatus(): Promise<ZetaStatus> {
    const [status, components, incidents] = await Promise.all([
        axios.get(`${ZETA_API_BASE}/status.json`),
        axios.get(`${ZETA_API_BASE}/components.json`),
        axios.get(`${ZETA_API_BASE}/incidents/unresolved.json`)
    ]);

    return {
        status: status.data,
        components: components.data,
        incidents: incidents.data
    };
}