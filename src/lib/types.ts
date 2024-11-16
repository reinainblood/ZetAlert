// src/lib/types.ts
export interface ZetaStatus {
    status: {
        indicator: 'none' | 'minor' | 'major' | 'critical';
        description: string;
    };
    components: Array<{
        name: string;
        status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
    }>;
    incidents: Array<{
        id: string;
        name: string;
        status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
        impact: 'none' | 'minor' | 'major' | 'critical';
        created_at: string;
        updated_at: string;
        message: string;
    }>;
}

export interface IntegrationMessage {
    id: string;
    platform: 'discord' | 'slack';
    content: string;
    timestamp: string;
}