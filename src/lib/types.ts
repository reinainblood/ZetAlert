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
        started_at: string | null;
        page_id: string;
        resolved_by_user_id: string | null;
        scheduled_remind_prior: boolean;
        scheduled_reminded_at: string | null;
        scheduled_auto_in_progress: boolean;
        scheduled_auto_completed: boolean;
        metadata: Record<string, unknown>;
        deliver_notifications: boolean;
        auto_transition_deliver_notifications: boolean;
        auto_transition_deliver_notifications_at: string | null;
        auto_transition_to_maintenance_state: boolean;
        auto_transition_to_operational_state: boolean;
        auto_transition_to_operational_state_at: string | null;
        reminder_intervals: string[];
    }>;
    scheduled_maintenances: Array<{
        id: string;
        name: string;
        status: 'scheduled' | 'in_progress' | 'verifying' | 'completed';
        created_at: string;
        updated_at: string;
        monitoring_at: string | null;
        resolved_at: string | null;
        impact: 'none' | 'minor' | 'major' | 'critical';
        shortlink: string;
        started_at: string | null;
        page_id: string;
        scheduled_for: string;
        scheduled_until: string;
        scheduled_remind_prior: boolean;
        scheduled_reminded_at: string | null;
        impact_override: boolean;
        metadata: Record<string, unknown>;
        deliver_notifications: boolean;
        auto_transition_deliver_notifications: boolean;
        auto_transition_deliver_notifications_at: string | null;
        auto_transition_to_maintenance_state: boolean;
        auto_transition_to_operational_state: boolean;
        auto_transition_to_operational_state_at: string | null;
        reminder_intervals: string[];
    }>;
}

// For the incoming webhook payload
export interface StatusWebhookPayload {
    event: 'status_updated';
    component_id: string;
    component_name: string;
    new_status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
    incident_id: string;
    timestamp: string;
}

// For message integrations
export interface IntegrationMessage {
    id: string;
    platform: 'discord' | 'slack';
    content: string;
    timestamp: string;
}