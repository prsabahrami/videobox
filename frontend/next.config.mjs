import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['react-dom'],
    distDir: './dist',
    sassOptions: {
        includePaths: [path.join(__dirname, 'app')],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `https://damp-lowlands-47243-f084d4f8fd4d.herokuapp.com/api/:path*`,
            },
        ];
    },

};

export default nextConfig;