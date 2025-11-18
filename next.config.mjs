/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Mantenemos tu configuración actual de IP
      {
        hostname: "172.190.0.166",
      },
      {
        protocol: "https", // Asegúrate de especificar el protocolo si la URL es HTTPS
        hostname: "ccvnd3lo965z.share.zrok.io",
      },
    ],
  },
};

export default nextConfig;
