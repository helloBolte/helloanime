/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "s4.anilist.co",
          },
        ],
      },
        eslint: {
          ignoreDuringBuilds: true, // Disable ESLint checks during build
        },
};

export default nextConfig;
