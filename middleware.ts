// src/middleware.ts
import { withAuth } from "next-auth/middleware";

// Export the middleware directly
export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token
    },
});

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/messages/:path*',
    ]
};