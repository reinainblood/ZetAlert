// src/app/auth/error/page.tsx
'use client';
import { Suspense } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { AuthErrorContent } from './AuthErrorContent';

export default function AuthError() {
    return (
        <AppLayout className="flex items-center justify-center">
            <Suspense fallback={
                <div className="bg-black/70 p-8 rounded-lg backdrop-blur max-w-md w-full">
                    <img src="/logo.png" alt="ZetAlert" className="w-32 mx-auto mb-8" />
                    <div className="text-center">
                        <h1 className="text-xl font-bold mb-4 text-white">Loading...</h1>
                    </div>
                </div>
            }>
                <AuthErrorContent />
            </Suspense>
        </AppLayout>
    );
}

// Create a new component for the content
