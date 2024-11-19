'use client';

import { useEffect, useState } from 'react';
import { IntegrationMessage, NetworkAlertMessage } from '@/lib/types';
import {MessageStore} from "@/lib/messageStore";

type CombinedAlertMessage = IntegrationMessage & NetworkAlertMessage;

export function AutomatedAlerts() {
    const [alerts, setAlerts] = useState<CombinedAlertMessage[]>([]);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const messages = await MessageStore.getRecentMessages();
                // Filter for network alert messages and ensure they have both IntegrationMessage and NetworkAlertMessage properties
                const networkAlerts = messages.filter((msg): msg is CombinedAlertMessage =>
                    'network' in msg &&
                    'blockLink' in msg &&
                    'info' in msg &&
                    'platform' in msg &&
                    'timestamp' in msg
                );
                setAlerts(networkAlerts);
            } catch (error) {
                console.error('Failed to fetch automated alerts:', error);
            }
        }

        fetchAlerts();
        // Refresh every 30 seconds
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Recent Network Alerts</h2>

            {alerts.length === 0 ? (
                <p className="text-gray-400">No recent network alerts</p>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-gray-800/80 p-4 rounded-lg border border-gray-700"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-purple-400 font-medium">
                                    {new Date(alert.timestamp).toLocaleString()}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    alert.platform === 'discord' ? 'bg-indigo-600' : 'bg-green-600'
                                }`}>
                                    {alert.platform}
                                </span>
                            </div>
                            <div className="mb-2">
                                <span className="text-gray-400">Network: </span>
                                <span className="text-white">{alert.network}</span>
                            </div>
                            <p className="text-white whitespace-pre-wrap">{alert.info}</p>
                            <a
                                href={alert.blocklink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-sm text-purple-400 hover:text-purple-300 inline-block"
                            >
                                View Block →
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}