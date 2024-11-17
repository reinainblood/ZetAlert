// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { User } from 'next-auth';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<User | null> {
                try {
                    if (!credentials?.username || !credentials?.password) {
                        console.log('Missing credentials');
                        return null;
                    }

                    const isValidUsername = credentials.username === process.env.DEMO_USER;
                    const isValidPassword = credentials.password === process.env.DEMO_PASS;

                    if (isValidUsername && isValidPassword) {
                        // Return a properly typed User object
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
                // Safely assign the id
                session.user = {
                    ...session.user,
                    id: token.id
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
});

export const GET = handler;
export const POST = handler;