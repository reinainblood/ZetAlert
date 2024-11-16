// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.username || !credentials?.password) {
                        console.log('Missing credentials');
                        return null;
                    }

                    // For development, use plain text password
                    const isValidUsername = credentials.username === process.env.DEMO_USER;
                    const isValidPassword = credentials.password === process.env.DEMO_PASS;

                    if (isValidUsername && isValidPassword) {
                        return {
                            id: '1',
                            name: credentials.username,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/',
        error: '/auth/error',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl + "/dashboard"
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    debug: true,
});

export const GET = handler;
export const POST = handler;