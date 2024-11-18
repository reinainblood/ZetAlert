// src/app/auth/error/AuthErrorContent.tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';

export function AuthErrorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');

    let errorMessage = 'An error occurred during authentication.';
    if (error === 'CredentialsSignin') {
        errorMessage = 'Invalid username or password.';
    }

    return (
        <div className="bg-black/70 p-8 rounded-lg backdrop-blur max-w-md w-full">
            <img src="/logo.png" alt="ZetAlert" className="w-32 mx-auto mb-8" />
            <div className="text-center">
                <h1 className="text-xl font-bold mb-4 text-white">Authentication Error</h1>
                <p className="text-red-400 mb-6">{errorMessage}</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700 transition text-white"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
}