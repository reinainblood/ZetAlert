// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Allow webhook endpoint to bypass auth
        if (req.nextUrl.pathname === '/api/webhook') {
            return NextResponse.next();
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
);

// Configure which routes to protect
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
        '/((?!api/webhook).*)',
    ]
};