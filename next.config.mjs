/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "172.190.0.162",
      },
      {
        protocol: "https",
        hostname: "apisigeactmd74.share.zrok.io",
      },
    ],
  },
  // --- Funciona el visualizador seguro ---
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
};

export default nextConfig;