/** @type {import('next').NextConfig} */
const nextConfig = {
    // Don't specify distDir or output
    images: {
        unoptimized: true
    },
    async headers() {
        return [
            {
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