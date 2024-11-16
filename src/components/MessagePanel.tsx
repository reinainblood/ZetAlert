// src/components/MessagePanel.tsx
'use client';
import { useState } from 'react';
import { IntegrationMessage } from '@/lib/types';
import axios from 'axios';

export function MessagePanel() {
    const [message, setMessage] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<('discord' | 'slack')[]>([]);
    const [sending, setSending] = useState(false);
    const [recentMessages, setRecentMessages] = useState<IntegrationMessage[]>([]);

    const handleSendMessage = async () => {
        if (!message || selectedPlatforms.length === 0) return;

        setSending(true);
        try {
            await axios.post('/api/messages', {
                message,
                platforms: selectedPlatforms
            });

            // Add to recent messages
            setRecentMessages(prev => [{
                id: Date.now().toString(),
                platform: selectedPlatforms[0],
                content: message,
                timestamp: new Date().toISOString()
            }, ...prev]);

            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Message Center</h2>

            <div className="mb-4">
        <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message (max 2000 characters)..."
            maxLength={2000}
            rows={4}
            className="w-full bg-gray-800/90 rounded p-3 text-white placeholder-gray-400 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
        />
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('discord')}
                        onChange={(e) => {
                            setSelectedPlatforms(prev =>
                                e.target.checked
                                    ? [...prev, 'discord']
                                    : prev.filter(p => p !== 'discord')
                            );
                        }}
                        className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                    />
                    <span>Discord</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('slack')}
                        onChange={(e) => {
                            setSelectedPlatforms(prev =>
                                e.target.checked
                                    ? [...prev, 'slack']
                                    : prev.filter(p => p !== 'slack')
                            );
                        }}
                        className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                    />
                    <span>Slack</span>
                </label>
            </div>

            <button
                onClick={handleSendMessage}
                disabled={sending || !message || selectedPlatforms.length === 0}
                className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-8"
            >
                {sending ? 'Sending...' : 'Send Message'}
            </button>

            {recentMessages.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold mb-3">Recent Messages</h3>
                    <div className="space-y-3">
                        {recentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className="bg-gray-800/70 rounded p-3 border border-gray-700"
                            >
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span className="capitalize">{msg.platform}</span>
                                    <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-100">{msg.content}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}