// src/app/page.tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';


export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: true,
                callbackUrl: '/dashboard'
            });

            // Note: This code won't run if redirect is true
            // Keeping it as a fallback
            if (result?.error) {
                setError('Invalid credentials');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center"
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="bg-black/70 p-8 rounded-lg backdrop-blur">
                <img src="/logo.png" alt="ZetAlert" className="w-48 mx-auto mb-8" />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-500 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm mb-1 text-white">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-white">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 p-2 rounded hover:bg-purple-700 transition text-white disabled:opacity-50"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </main>
    );
}