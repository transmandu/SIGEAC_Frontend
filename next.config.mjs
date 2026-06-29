const parseHostnamePattern = (value) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return { protocol: url.protocol.replace(":", ""), hostname: url.hostname };
  } catch {
    // Bare hostname with no scheme (e.g. "172.190.0.149") - assume plain
    // http, which matches local/dev backends; production should set
    // NEXT_PUBLIC_HOSTNAME as a full https:// URL instead.
    return { protocol: "http", hostname: value };
  }
};

const hostnamePattern = parseHostnamePattern(process.env.NEXT_PUBLIC_HOSTNAME);

const nextConfig = {
  images: {
    remotePatterns: [
      ...(hostnamePattern
        ? [
            {
              protocol: hostnamePattern.protocol,
              hostname: hostnamePattern.hostname,
              pathname: "/storage/**",
            },
          ]
        : []),
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