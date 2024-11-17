// src/components/StatusPanel.tsx
'use client';
import { useState } from 'react';
import { ZetaSummary } from '@/lib/types';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusPanelProps {
    status: ZetaSummary;
}

export function StatusPanel({ status }: StatusPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const components = Array.isArray(status?.components) ? status.components : [];

    const mainnet = components.find(c => c?.name?.toLowerCase().includes('mainnet'));
    const testnet = components.find(c => c?.name?.toLowerCase().includes('testnet'));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'bg-green-500';
            case 'degraded_performance': return 'bg-yellow-500';
            case 'partial_outage': return 'bg-orange-500';
            case 'major_outage': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const hasActiveIncidents = status.incidents.length > 0;
    const hasIssues = mainnet?.status !== 'operational' || testnet?.status !== 'operational';

    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg">
            {/* Collapsed View */}
            <div
                className="p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold">Network Status</h2>
                        {(hasIssues || hasActiveIncidents) && (
                            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-sm">
                {hasActiveIncidents ? `${status.incidents.length} Active Incidents` : 'Issues Detected'}
              </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Quick Status Indicators */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">Mainnet:</span>
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(mainnet?.status || 'unknown')}`} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">Testnet:</span>
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(testnet?.status || 'unknown')}`} />
                            </div>
                        </div>
                        <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-gray-800"
                    >
                        <div className="p-4 space-y-4">
                            {/* Network Status Details */}
                            <div className="grid grid-cols-2 gap-4">
                                {[mainnet, testnet].map((network) => network && (
                                    <div key={network.name} className="bg-gray-800/50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">{network.name}</h3>
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(network.status)}`}>
                        {network.status.replace('_', ' ')}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Active Incidents */}
                            {hasActiveIncidents && (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-sm text-gray-400">Active Incidents</h3>
                                    {status.incidents.map((incident) => (
                                        <div key={incident.id} className="bg-gray-800/50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">{incident.name}</p>
                                                    <span className="text-xs text-gray-400">
                            {new Date(incident.updated_at).toLocaleString()}
                          </span>
                                                </div>
                                                <a
                                                    href={incident.shortlink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                                >
                                                    Details →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

