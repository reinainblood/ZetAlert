
// src/components/SignOutButton.tsx
'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
        >
            Sign Out
        </button>
    );
}