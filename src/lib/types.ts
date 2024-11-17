// src/lib/types.ts
export interface ZetaSummary {
    page: {
        id: string;
        name: string;
        url: string;
        time_zone: string;
        updated_at: string;
    };
    status: {
        indicator: 'none' | 'minor' | 'major' | 'critical';
        description: string;
    };
    components: Array<{
        id: string;
        name: string;
        status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
        created_at: string;
        updated_at: string;
        position: number;
        description: string | null;
        showcase: boolean;
        start_date: string | null;
        group_id: string | null;
        page_id: string;
        group: boolean;
        only_show_if_degraded: boolean;
    }>;
    incidents: Array<{
        id: string;
        name: string;
        status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
        impact: 'none' | 'minor' | 'major' | 'critical';
        shortlink: string;
        created_at: string;
        updated_at: string;
        monitoring_at: string | null;
        resolved_at: string | null;
        impact_override: boolean;
        scheduled_for: string | null;
        scheduled_until: string | null;
    }>;
    scheduled_maintenances: Array<{
        id: string;
        name: string;
        status: 'scheduled' | 'in_progress' | 'verifying' | 'completed';
        impact: 'none' | 'minor' | 'major' | 'critical';
        scheduled_for: string;
        scheduled_until: string;
        shortlink: string;
        created_at: string;
        updated_at: string;
    }>;
}

export interface IncidentMessage {
    type: 'incident';
    name: string;
    status: string;
    impact: string;
    updated_at: string;
    shortlink: string;
}

export interface MaintenanceMessage {
    type: 'maintenance';
    name: string;
    status: string;
    scheduled_for: string;
    scheduled_until: string;
    shortlink: string;
}

export interface IntegrationMessage {
    id: string;
    platform: 'discord' | 'slack';
    content: string;
    timestamp: string;
    source: 'manual' | 'automatic'; // Add this to distinguish between user-sent and webhook-triggered messages
    trigger?: {      // Optional context about what triggered the automatic message
        type: string; //'status_update' | 'incident' | 'maintenance';
        componentName?: string;
        componentId?: string;
    };
    status?: string;
    error?: string;
}

export type StatusMessage = IncidentMessage | MaintenanceMessage | string;