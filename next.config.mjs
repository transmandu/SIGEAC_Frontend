/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http", // O "https" si tiene certificado
        hostname: "172.190.0.162",
      },
      {
        protocol: "https",
        hostname: "apisigeactmd74.share.zrok.io",
      },
    ],
  },
};

export default nextConfig;
