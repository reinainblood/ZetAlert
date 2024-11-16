// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { StatusPanel } from '@/components/StatusPanel';
import { MessagePanel } from '@/components/MessagePanel';
import { WebhookConfig } from '@/components/WebhookConfig';
import { fetchZetaStatus } from '@/lib/api';
import { SignOutButton } from '@/components/SignOutButton';

export default async function Dashboard() {
    const session = await getServerSession();
    const status = await fetchZetaStatus();

    return (
        <main
            className="min-h-screen p-8"
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <img src="/logo.png" alt="ZetAlert" className="w-32" />
                    <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Logged in as {session?.user?.name}
            </span>
                        <SignOutButton />
                    </div>
                </div>

                <StatusPanel status={status} />
                <MessagePanel
                    recentMessages={[]}
                    onSendMessage={async (message, platforms) => {
                        // Will implement in next step
                    }}
                />
                <WebhookConfig />
            </div>
        </main>
    );
}