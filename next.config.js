// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove 'output: standalone' if it's there
    // Add proper distDir config for Vercel
    distDir: '.next',
    images: {
        unoptimized: true
    },
    async headers() {
        return [
            {
                // Specific headers for the external webhook endpoint
                source: "/api/ext-webhook",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "https://status.zetachain.com" },
                    { key: "Access-Control-Allow-Methods", value: "POST" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type" },
                ]
            }
        ]
    }
}

module.exports = nextConfig