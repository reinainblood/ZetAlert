// src/components/WebhookConfig.tsx
'use client';
import { useState } from 'react';

export function WebhookConfig() {
    const [discordWebhook, setDiscordWebhook] = useState('');
    const [slackWebhook, setSlackWebhook] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const updateWebhooks = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // In a real app, you might want to store these securely
            // For now, we'll just update them in memory
            setMessage({
                type: 'success',
                text: 'Webhook URLs updated successfully'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to update webhook URLs'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Webhook Configuration</h2>

            {message && (
                <div className={`mb-4 p-3 rounded ${
                    message.type === 'success' ? 'bg-green-500/20 border border-green-500' :
                        'bg-red-500/20 border border-red-500'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Discord Webhook URL</label>
                    <input
                        type="text"
                        value={discordWebhook}
                        onChange={(e) => setDiscordWebhook(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full p-2 rounded bg-gray-800/90 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Slack Webhook URL</label>
                    <input
                        type="text"
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full p-2 rounded bg-gray-800/90 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                </div>

                <button
                    onClick={updateWebhooks}
                    disabled={saving}
                    className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Updating...' : 'Update Webhooks'}
                </button>
            </div>
        </div>
    );
}