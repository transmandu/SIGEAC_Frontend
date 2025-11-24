/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "172.190.0.166",
      },
      {
        protocol: "https",
        hostname: "ccvnd3lo965z.share.zrok.io",
      },
    ],
  },
};

export default nextConfig;
