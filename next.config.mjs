import { execSync } from "node:child_process";

import pkg from "./package.json" with { type: "json" };

// El commit sella qué build está desplegado. En el servidor puede no haber
// .git (deploy por archivos), así que NEXT_PUBLIC_COMMIT lo fija el deploy y
// git queda como respaldo en desarrollo.
const resolveCommit = () => {
  if (process.env.NEXT_PUBLIC_COMMIT) return process.env.NEXT_PUBLIC_COMMIT;

  try {
    // --short=7 fijo: sin longitud explícita git la elige según el tamaño del
    // repo y los dos lados mostrarían el commit con distinto formato.
    return execSync("git rev-parse --short=7 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
};

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
  turbopack: {
    resolveAlias: {
      // pdfjs-dist pide `canvas` desde una rama que sólo corre en Node.
      canvas: "./lib/empty-module.ts",
    },
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_COMMIT: resolveCommit() ?? "",
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
  },
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
    // Next 16 pasó el default a [75] y coercería el quality={100} de la foto
    // del empleado, que es el único lugar que pide calidad máxima.
    qualities: [75, 100],
    // Y el default pasó de 60 s a 4 h: las imágenes son subidas del backend
    // que el usuario reemplaza y espera ver al instante.
    minimumCacheTTL: 60,
  },
};

export default nextConfig;