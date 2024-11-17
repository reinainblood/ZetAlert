// src/components/Toolbar.tsx
'use client';
import Link from 'next/link';
import { SignOutButton } from './SignOutButton';
import { ExternalLink } from 'lucide-react';

export function Toolbar() {
    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur border-b border-gray-800 z-50">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img src="/logo.png" alt="ZetAlert" className="h-8" />
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href="https://status.zetachain.com"
                        target="_blank"
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800"
                    >
                        <span>Official Status Page</span>
                        <ExternalLink size={16} />
                    </Link>
                    <SignOutButton />
                </div>
            </div>
        </div>
    );
}