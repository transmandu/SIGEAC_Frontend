/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "172.190.0.162",
      },
      {
        protocol: "http", // O "https" si tiene certificado
        hostname: "172.190.0.149",
        port: "81",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "apisigeactmd74.share.zrok.io",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
  // --- Funciona el visualizador seguro ---
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
};

export default nextConfig;