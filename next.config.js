/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true
    },
    async headers() {
        return [
            {
                // Specific headers for the webhook endpoint
                source: "/api/webhook",
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