/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
        // domains: ['fonts.googleapis.com', 'fonts.gstatic.com'],
    },
    staticPageGenerationTimeout: 120,
    

    async redirects() {
        return [
            {
                source: '/search',
                destination: '/',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;