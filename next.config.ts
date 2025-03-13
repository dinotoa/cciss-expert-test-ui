import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/traffic', // Replace with your target page
        permanent: true, // Use true for 308 permanent redirect, false for 307 temporary redirect
      },
    ]
  },
};

export default nextConfig;
