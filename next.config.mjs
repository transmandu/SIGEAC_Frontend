/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "172.190.0.162",
      },
      {
        protocol: "https",
        hostname: "https://apisigeac.share.zrok.io",
      },
    ],
  },
};

export default nextConfig;
