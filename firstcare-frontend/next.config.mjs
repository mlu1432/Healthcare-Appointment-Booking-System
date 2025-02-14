/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['fonts.googleapis.com', 'fonts.gstatic.com'],
    },
    staticPageGenerationTimeout: 120,
    output: 'standalone',
};

export default nextConfig;
