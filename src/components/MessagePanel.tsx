// src/components/MessagePanel.tsx
'use client';
import {useEffect, useState} from 'react';
import { ZetaSummary, IntegrationMessage } from '@/lib/types';
import { Send, Check, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';

interface MessagePanelProps {
    status: ZetaSummary; // Add this prop to receive status data
}

function MessageItem({ message }: { message: IntegrationMessage }) {
    return (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
                <div className="flex items-center space-x-2">
                    <span className="capitalize">{message.platform}</span>
                    {message.source === 'automatic' && (
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
              🤖 Auto
            </span>
                    )}
                    {message.trigger && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs">
              {message.trigger.componentName}
            </span>
                    )}
                </div>
                <span>{new Date(message.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
    );
}
export function MessagePanel({ status }: MessagePanelProps) {

    const [message, setMessage] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<('discord' | 'slack')[]>([]);
    const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [recentMessages, setRecentMessages] = useState<IntegrationMessage[]>([]);


    // Fetch recent messages on mount and periodically
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('/api/messages');
                setRecentMessages(response.data.messages);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        void fetchMessages();
        const interval = setInterval(fetchMessages, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    // Combine incidents and scheduled maintenances
    const allNotifiableEvents = [
        ...status.incidents.map(incident => ({
            id: incident.id,
            name: incident.name,
            type: 'incident' as const,
            status: incident.status,
            impact: incident.impact,
            time: incident.created_at,
            url: incident.shortlink
        })),
        ...status.scheduled_maintenances.map(maintenance => ({
            id: maintenance.id,
            name: maintenance.name,
            type: 'maintenance' as const,
            status: maintenance.status,
            impact: maintenance.impact,
            time: maintenance.scheduled_for,
            url: maintenance.shortlink
        }))
    ];

    const formatEventMessage = (event: typeof allNotifiableEvents[0]) => {
        const emoji = event.type === 'incident' ? '🔔' : '🗓️';
        const typeLabel = event.type === 'incident' ? 'Incident' : 'Scheduled Maintenance';
        const timeLabel = event.type === 'incident' ? 'Started' : 'Scheduled for';

        return [
            `${emoji} **${typeLabel} Update**: ${event.name}`,
            `Status: ${event.status.toUpperCase()}`,
            `Impact: ${event.impact.toUpperCase()}`,
            `${timeLabel}: ${new Date(event.time).toLocaleString()}`,
            `Details: ${event.url}`,
        ].join('\n');
    };

    const handleSendMessage = async () => {
        if ((!message && selectedIncidents.length === 0) || selectedPlatforms.length === 0) return;

        setSending(true);
        try {
            // Send custom message if there is one
            if (message) {
                await axios.post('/api/messages', {
                    message,
                    platforms: selectedPlatforms
                });
            }

            // Send selected incidents/maintenances
            for (const eventId of selectedIncidents) {
                const event = allNotifiableEvents.find(e => e.id === eventId);
                if (event) {
                    const formattedMessage = formatEventMessage(event);
                    await axios.post('/api/messages', {
                        message: formattedMessage,
                        platforms: selectedPlatforms
                    });

                    // Add to recent messages
                    setRecentMessages(prev => [{
                        id: Date.now().toString(),
                        platform: selectedPlatforms[0],
                        content: formattedMessage,
                        timestamp: new Date().toISOString(),
                        source: "manual"
                    }, ...prev]);
                }
            }

            setMessage('');
            setSelectedIncidents([]);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const getSeverityColor = (impact: string) => {
        switch (impact) {
            case 'critical': return 'text-red-400 bg-red-500/10';
            case 'major': return 'text-orange-400 bg-orange-500/10';
            case 'minor': return 'text-yellow-400 bg-yellow-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-6">Message Center</h2>

            {/* Platform Selection */}
            <div className="flex space-x-4 mb-6">
                {['discord', 'slack'].map(platform => (
                    <label key={platform} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform as 'discord' | 'slack')}
                            onChange={(e) => {
                                setSelectedPlatforms(prev =>
                                    e.target.checked
                                        ? [...prev, platform as 'discord' | 'slack']
                                        : prev.filter(p => p !== platform)
                                );
                            }}
                            className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="capitalize">{platform}</span>
                    </label>
                ))}
            </div>

            {/* Incidents & Maintenance Selection */}
            {allNotifiableEvents.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Select Events to Share:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {allNotifiableEvents.map((event) => (
                            <label
                                key={event.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 cursor-pointer hover:border-gray-600/50 transition-colors ${
                                    selectedIncidents.includes(event.id) ? 'border-purple-500/50' : ''
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIncidents.includes(event.id)}
                                    onChange={(e) => {
                                        setSelectedIncidents(prev =>
                                            e.target.checked
                                                ? [...prev, event.id]
                                                : prev.filter(id => id !== event.id)
                                        );
                                    }}
                                    className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        {event.type === 'incident' ? <AlertCircle size={16} /> : <Calendar size={16} />}
                                        <span className="font-medium">{event.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(event.impact)}`}>
                      {event.impact.toUpperCase()}
                    </span>
                                        <span className="text-xs text-gray-400">
                      {event.type === 'incident' ? 'Started' : 'Scheduled for'}: {new Date(event.time).toLocaleString()}
                    </span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Message Input */}
            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400">Custom Message (Optional):</label>
                    <span className="text-xs text-gray-500">{message.length}/2000</span>
                </div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter additional message..."
                    maxLength={2000}
                    rows={3}
                    className="w-full bg-gray-800/90 rounded-lg p-3 text-white placeholder-gray-400 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                />
            </div>

            {/* Send Button */}
            <button
                onClick={handleSendMessage}
                disabled={sending || (!message && selectedIncidents.length === 0) || selectedPlatforms.length === 0}
                className="flex items-center justify-center space-x-2 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
                {sending ? (
                    <>
                        <span>Sending...</span>
                        <Check className="animate-pulse" size={20} />
                    </>
                ) : (
                    <>
                        <span>Send Message{selectedIncidents.length > 0 ? `s (${selectedIncidents.length + (message ? 1 : 0)})` : ''}</span>
                        <Send size={20} />
                    </>
                )}
            </button>

            {/* Recent Messages */}
            {recentMessages.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Messages:</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {recentMessages.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Messages:</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {recentMessages.map((msg) => (
                                        <MessageItem key={msg.id} message={msg} />
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}