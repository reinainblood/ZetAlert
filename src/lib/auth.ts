// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
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

                    const isValidUsername = credentials.username === process.env.DEMO_USER;
                    const isValidPassword = credentials.password === process.env.DEMO_PASS;

                    if (isValidUsername && isValidPassword) {
                        return {
                            id: '1',
                            name: credentials.username,
                            email: null,
                            image: null
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
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    ...session.user,
                    id: token.id as string
                };
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
    },
    debug: true,
};
export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}