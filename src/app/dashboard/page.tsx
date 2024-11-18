// src/app/dashboard/page.tsx


import { StatusPanel } from '@/components/StatusPanel';
import { MessagePanel } from '@/components/MessagePanel';
import { WebhookConfig } from '@/components/WebhookConfig';
import { fetchZetaStatus } from '@/lib/api';
import { Toolbar } from '@/components/Toolbar';
import { AppLayout } from '@/components/AppLayout';
import { redirect } from 'next/navigation';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/');
    }

    const status = await fetchZetaStatus();

    return (
        <>
            <Toolbar />
            <AppLayout className="pt-24 px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12">
                            <StatusPanel status={status} />
                        </div>
                        <div className="col-span-12 lg:col-span-8">
                            <MessagePanel status={status} />
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <WebhookConfig />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}