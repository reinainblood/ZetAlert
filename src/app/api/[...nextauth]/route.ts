// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

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

                    const validUsername = process.env.DEMO_USER;
                    const validPasswordHash = process.env.DEMO_PASS_HASH;

                    if (!validUsername || !validPasswordHash) {
                        console.error('Environment variables DEMO_USER or DEMO_PASS_HASH are not set');
                        return null;
                    }

                    const isValidUsername = credentials.username === validUsername;
                    const isValidPassword = await bcrypt.compare(credentials.password, validPasswordHash);

                    if (isValidUsername && isValidPassword) {
                        return {
                            id: '1',
                            name: validUsername,
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
        error: '/', // Redirect errors back to homepage
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    debug: process.env.NODE_ENV === 'development',
});

export const GET = handler;
export const POST = handler;