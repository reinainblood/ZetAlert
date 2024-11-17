// src/components/MessagePanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { ZetaSummary, IntegrationMessage } from '@/lib/types';
import { AlertCircle, Check, Send } from 'lucide-react';
import axios from 'axios';
import { MessageStore } from '@/lib/messageStore';
import { motion, AnimatePresence } from 'framer-motion';

interface MessagePanelProps {
    status: ZetaSummary;
}

export function MessagePanel({ status }: MessagePanelProps) {
    const [message, setMessage] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<('discord' | 'slack')[]>([]);
    const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentMessages, setRecentMessages] = useState<IntegrationMessage[]>([]);

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
        const interval = setInterval(() => void fetchMessages(), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if ((!message && selectedIncidents.length === 0) || selectedPlatforms.length === 0) return;

        setSending(true);
        setError(null);
        try {
            if (message) {
                const response = await axios.post('/api/messages', {
                    message,
                    platforms: selectedPlatforms
                });

                if (!response.data.success) {
                    throw new Error('Failed to send message');
                }
            }

            for (const incidentId of selectedIncidents) {
                const incident = status.incidents.find(inc => inc.id === incidentId);
                if (incident) {
                    const formattedMessage = [
                        `🔔 **Incident Update**: ${incident.name}`,
                        `Status: ${incident.status.toUpperCase()}`,
                        `Impact: ${incident.impact.toUpperCase()}`,
                        `Updated: ${new Date(incident.updated_at).toLocaleString()}`,
                        `Details: ${incident.shortlink}`
                    ].join('\n');

                    const response = await axios.post('/api/messages', {
                        message: formattedMessage,
                        platforms: selectedPlatforms
                    });

                    if (!response.data.success) {
                        throw new Error('Failed to send incident update');
                    }
                }
            }

            setMessage('');
            setSelectedIncidents([]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const IncidentItem = ({ incident }: { incident: ZetaSummary['incidents'][0] }) => {
        const [sentStatus, setSentStatus] = useState<{
            sent: boolean;
            platforms: ('discord' | 'slack')[];
            timestamp?: string;
            type: 'manual' | 'automatic';
        }>({ sent: false, platforms: [], type: 'manual' });

        useEffect(() => {
            void (async () => {
                const status = await MessageStore.hasBeenSent(incident.id);
                setSentStatus(status);
            })();
        }, [incident.id]);

        return (
            <label
                className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 border ${
                    selectedIncidents.includes(incident.id)
                        ? 'border-purple-500/50'
                        : sentStatus.sent
                            ? sentStatus.type === 'automatic'
                                ? 'border-blue-500/50'
                                : 'border-green-500/50'
                            : 'border-gray-700/50'
                } cursor-pointer hover:border-gray-600/50 transition-colors`}
            >
                <input
                    type="checkbox"
                    checked={selectedIncidents.includes(incident.id)}
                    onChange={(e) => {
                        setSelectedIncidents(prev =>
                            e.target.checked
                                ? [...prev, incident.id]
                                : prev.filter(id => id !== incident.id)
                        );
                    }}
                    className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <AlertCircle size={16} />
                            <span className="font-medium">{incident.name}</span>
                        </div>
                        {sentStatus.sent && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center space-x-2"
                            >
                <span className={`text-xs ${
                    sentStatus.type === 'automatic'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-green-500/10 text-green-400'
                } px-2 py-1 rounded-full flex items-center gap-1`}>
                  <Check size={12} />
                    {sentStatus.type === 'automatic' ? '🤖 Auto-sent' : 'Sent'}
                </span>
                                <div className="flex -space-x-1">
                                    {sentStatus.platforms.map(platform => (
                                        <motion.div
                                            key={platform}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                                                sentStatus.type === 'automatic'
                                                    ? 'bg-blue-800/50 border-blue-700'
                                                    : 'bg-green-800/50 border-green-700'
                                            }`}
                                            title={`Sent to ${platform}`}
                                        >
                                            {platform === 'discord' ? 'D' : 'S'}
                                        </motion.div>
                                    ))}
                                </div>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-gray-400"
                                    title={new Date(sentStatus.timestamp!).toLocaleString()}
                                >
                                    {formatRelativeTime(new Date(sentStatus.timestamp!))}
                                </motion.span>
                            </motion.div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(incident.impact)}`}>
              {incident.impact.toUpperCase()}
            </span>
                        <span className="text-xs text-gray-400">
              Updated: {new Date(incident.updated_at).toLocaleString()}
            </span>
                    </div>
                </div>
            </label>
        );
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    };

    const getSeverityColor = (impact: string) => {
        switch (impact) {
            case 'critical':
                return 'text-red-400 bg-red-500/10';
            case 'major':
                return 'text-orange-400 bg-orange-500/10';
            case 'minor':
                return 'text-yellow-400 bg-yellow-500/10';
            default:
                return 'text-gray-400 bg-gray-500/10';
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

            {/* Incidents Selection */}
            {status.incidents.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Select Events to Share:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {status.incidents.map((incident) => (
                            <IncidentItem key={incident.id} incident={incident} />
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
                    disabled={sending}
                />
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    {error}
                </div>
            )}

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
                        {recentMessages.map((msg) => (
                            <div key={msg.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="capitalize">{msg.platform}</span>
                                        {msg.source === 'automatic' && (
                                            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                        🤖 Auto
                      </span>
                                        )}
                                    </div>
                                    <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}